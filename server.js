// Load environment variables FIRST before anything else
require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const formatMessage = require("./utils/messages");
const {
  initDatabase,
  getRoomMessages,
  saveMessage,
  cleanOldMessages,
  saveFlaggedMessage,
  getFlaggedMessages,
  reviewFlaggedMessage,
  deleteMessageFromDB
} = require("./utils/database");
const { moderateMessage } = require("./utils/aiModeration");
const {
  getAuth0Config,
  userInfoMiddleware,
  isAuth0Enabled,
  requiresAuth
} = require("./utils/auth");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

// Superuser configuration - add your username here
const SUPERUSERS = (process.env.SUPERUSERS || 'admin').split(',');

// Store message reactions in memory (in production, use database)
const messageReactions = new Map();
const messageIds = new Map(); // Track message IDs

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Auth0 Configuration (optional - app works without it)
const auth0Config = getAuth0Config();
if (auth0Config) {
  const { auth } = require('express-openid-connect');
  app.use(auth(auth0Config));
  app.use(userInfoMiddleware);
  console.log('🔐 Auth0 authentication enabled');
} else {
  console.log('ℹ️  Running without Auth0 authentication');
}

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'connected' : 'not configured',
    auth0: isAuth0Enabled() ? 'enabled' : 'disabled'
  });
});

// Auth0 routes (for getting user info via API)
app.get('/api/user', (req, res) => {
  if (isAuth0Enabled() && req.oidc?.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        name: req.oidc.user.name,
        email: req.oidc.user.email,
        picture: req.oidc.user.picture,
        sub: req.oidc.user.sub
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Profile page (protected route example)
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/css/style.css">
      <title>Profile - ChatCord</title>
    </head>
    <body>
      <div class="join-container">
        <header class="join-header">
          <h1>👤 Your Profile</h1>
        </header>
        <main class="join-main">
          <div class="profile-info">
            <img src="${req.oidc.user.picture}" alt="Profile" style="border-radius: 50%; width: 100px; height: 100px;">
            <h2>${req.oidc.user.name}</h2>
            <p>${req.oidc.user.email}</p>
          </div>
          <br>
          <a href="/" class="btn">Back to Chat</a>
          <a href="/logout" class="btn" style="background: #dc3545;">Logout</a>
        </main>
      </div>
    </body>
    </html>
  `);
});

// Admin API - Get flagged messages
app.get('/api/admin/flagged', async (req, res) => {
  // Simple auth check - in production, use proper authentication
  const username = req.query.username;
  
  if (!SUPERUSERS.includes(username)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const flaggedMessages = await getFlaggedMessages('pending', 100);
  res.json({ messages: flaggedMessages });
});

// Admin API - Review flagged message
app.post('/api/admin/review', express.json(), async (req, res) => {
  const { messageId, action, adminUsername } = req.body;
  
  if (!SUPERUSERS.includes(adminUsername)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  await reviewFlaggedMessage(messageId, action, adminUsername);
  
  // If rejected, delete the message from all clients
  if (action === 'rejected') {
    io.emit('messageDeleted', { messageId });
    await deleteMessageFromDB(messageId);
  }
  
  res.json({ success: true });
});


const botName = "ChatCord Bot";

// Initialize database on startup
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  // Continue running even if DB fails (graceful degradation)
});

/*
// Optional Redis-based adapter initialization. Commented out for simplified setup
// (no Redis required). Re-enable if you add Redis back and want adapter scaling.
(async () => {
  pubClient = createClient({ url: "redis://127.0.0.1:6379" });
  await pubClient.connect();
  subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
})();
*/

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  
  socket.on("joinRoom", async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    const isSuperuser = SUPERUSERS.includes(username);

    socket.join(user.room);
    
    // Send superuser status to client
    socket.emit("superuserStatus", { isSuperuser });

    // Load and send message history from PostgreSQL
    try {
      const history = await getRoomMessages(user.room, 100);
      if (history.length > 0) {
        // Add IDs and superuser status to historical messages
        const enrichedHistory = history.map(msg => ({
          ...msg,
          id: msg.message_id || `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isSuperuser: SUPERUSERS.includes(msg.username),
          reactions: {}
        }));
        socket.emit("messageHistory", enrichedHistory);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    }

    // Welcome current user
    const welcomeMsg = formatMessage(botName, "Welcome to ChatCord!");
    welcomeMsg.id = `welcome-${socket.id}-${Date.now()}`;
    welcomeMsg.isSuperuser = false;
    welcomeMsg.reactions = {};
    socket.emit("message", welcomeMsg);

    // Broadcast when a user connects
    const joinMsg = formatMessage(botName, `${user.username} has joined the chat`);
    joinMsg.id = `join-${socket.id}-${Date.now()}`;
    joinMsg.isSuperuser = false;
    joinMsg.reactions = {};
    socket.broadcast.to(user.room).emit("message", joinMsg);
    
    // Save join message to PostgreSQL
    await saveMessage(user.room, botName, `${user.username} has joined the chat`, joinMsg.id, 'system', joinMsg.time);

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage with AI moderation
  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);
    const messageId = `${user.room}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // AI Moderation Check
    const moderationResult = await moderateMessage(msg, user.room);
    
    // If message is blocked, notify user and don't send
    if (moderationResult.blocked) {
      socket.emit("messageBlocked", {
        reason: moderationResult.reason,
        confidence: moderationResult.confidence
      });
      console.log(`🚫 Message blocked from ${user.username}: ${moderationResult.reason}`);
      return;
    }
    
    // If message is flagged, save for admin review but still send
    if (moderationResult.flagged) {
      await saveFlaggedMessage(
        messageId,
        user.room,
        user.username,
        msg,
        moderationResult.reason,
        moderationResult.confidence,
        moderationResult.moderationType
      );
      console.log(`🚩 Message flagged from ${user.username}: ${moderationResult.reason}`);
    }
    
    const message = formatMessage(user.username, msg);
    message.id = messageId;
    message.isSuperuser = SUPERUSERS.includes(user.username);
    message.reactions = {};
    message.flagged = moderationResult.flagged; // Mark as flagged in UI
    
    // Store message ID for tracking
    messageIds.set(messageId, { room: user.room, username: user.username, text: msg, time: message.time });
    
    io.to(user.room).emit("message", message);
    
    // Save message to PostgreSQL
    await saveMessage(user.room, user.username, msg, messageId, 'text', message.time);
    
    // Optional: Clean old messages periodically (keep last 1000)
    // await cleanOldMessages(user.room, 1000);
  });

  // Handle emoji reactions
  socket.on("addReaction", ({ messageId, emoji, username }) => {
    const messageData = messageIds.get(messageId);
    if (!messageData) {
      console.log(`❌ Message ${messageId} not found for reaction`);
      return;
    }
    
    // Get or create reactions for this message
    if (!messageReactions.has(messageId)) {
      messageReactions.set(messageId, {});
    }
    
    const reactions = messageReactions.get(messageId);
    
    // Toggle reaction
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
    const userIndex = reactions[emoji].indexOf(username);
    if (userIndex > -1) {
      // Remove reaction
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
      console.log(`➖ ${username} removed reaction ${emoji} from message ${messageId}`);
    } else {
      // Add reaction
      reactions[emoji].push(username);
      console.log(`➕ ${username} added reaction ${emoji} to message ${messageId}`);
    }
    
    // Broadcast the reaction update to the room with full user list
    io.to(messageData.room).emit("emojiReaction", { 
      messageId, 
      emoji, 
      users: reactions[emoji] || [],  // Send full list of users who reacted
      action: userIndex > -1 ? 'remove' : 'add'  // Tell clients if it was add or remove
    });
  });

  // Handle message deletion
  socket.on("deleteMessage", async ({ messageId }) => {
    const user = getCurrentUser(socket.id);
    const messageData = messageIds.get(messageId);
    
    if (!messageData) {
      console.log(`❌ Message ${messageId} not found`);
      return;
    }
    
    // Check if user is authorized to delete (superuser or message owner)
    const isAuthorized = SUPERUSERS.includes(user.username) || messageData.username === user.username;
    
    if (!isAuthorized) {
      console.log(`❌ Unauthorized delete attempt by ${user.username} for message ${messageId}`);
      socket.emit("deleteFailed", { reason: "Not authorized" });
      return;
    }
    
    // Remove from tracking
    messageIds.delete(messageId);
    messageReactions.delete(messageId);
    
    // Delete from database
    await deleteMessageFromDB(messageId);
    
    // Broadcast deletion to room
    io.to(messageData.room).emit("messageDeleted", { messageId });
    
    console.log(`🗑️ Message ${messageId} deleted by ${user.username}`);
  });

  // Runs when client disconnects
  socket.on("disconnect", async () => {
    const user = userLeave(socket.id);

    if (user) {
      const leaveMsg = formatMessage(botName, `${user.username} has left the chat`);
      leaveMsg.id = `leave-${socket.id}-${Date.now()}`;
      leaveMsg.isSuperuser = false;
      leaveMsg.reactions = {};
      io.to(user.room).emit("message", leaveMsg);
      
      // Save leave message to PostgreSQL
      await saveMessage(user.room, botName, `${user.username} has left the chat`, leaveMsg.id, 'system', leaveMsg.time);

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  // ============== Dashboard Post Handlers ==============
  
  // Handle new post creation
  socket.on("createPost", (post) => {
    console.log(`📝 New post created by ${post.author} in category: ${post.category}`);
    
    // Broadcast to all connected clients
    io.emit("newPost", post);
  });

  // Handle post updates (likes, comments, etc.)
  socket.on("updatePost", (post) => {
    console.log(`🔄 Post ${post.id} updated by user`);
    
    // Broadcast update to all clients
    io.emit("postUpdated", post);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
