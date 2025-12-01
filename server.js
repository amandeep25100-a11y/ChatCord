// Load environment variables FIRST before anything else
require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = '/uploads/' + req.file.filename;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// AI Chat endpoint (using Google Gemini)
app.post('/api/ai-chat', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDcHd7hXAAGMDS0X2ebptc2UGVW5Tz_dIg';
    
    if (!GEMINI_API_KEY) {
      return res.json({ 
        response: "I'm currently in demo mode. To enable AI responses, please configure the GEMINI_API_KEY environment variable.\n\nHowever, I can still help! Here's a simple example:\n\n```javascript\n// Reverse a string\nfunction reverseString(str) {\n  return str.split('').reverse().join('');\n}\n\nconsole.log(reverseString('hello')); // 'olleh'\n```"
      });
    }

    // Call Google Gemini API (using gemini-1.5-flash model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful coding assistant. Help users with programming questions, debugging, code explanations, and best practices. Format code using markdown code blocks with language specified. Be concise but thorough. Focus on JavaScript, Python, Java, C++, and web development.\n\nUser question: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error status:', response.status);
      console.error('Gemini API error response:', errorData);
      
      // Return user-friendly error with fallback response
      return res.json({ 
        response: "I'm having trouble connecting to the AI service right now. 😔\n\nLet me help you with a common example instead:\n\n```javascript\n// Array methods in JavaScript\nconst numbers = [1, 2, 3, 4, 5];\n\n// Map - transform each element\nconst doubled = numbers.map(n => n * 2);\n// [2, 4, 6, 8, 10]\n\n// Filter - keep elements that match condition\nconst evens = numbers.filter(n => n % 2 === 0);\n// [2, 4]\n\n// Reduce - combine elements into single value\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\n// 15\n```\n\nPlease try again in a moment!"
      });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      return res.json({ 
        response: "I received an unusual response from the AI service. Here's a helpful tip instead:\n\n**JavaScript Best Practices:**\n- Use `const` for values that won't change\n- Use `let` for values that will change\n- Avoid `var` in modern JavaScript\n- Always use strict equality (`===`) instead of loose equality (`==`)"
      });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('AI Chat error:', error.message);
    console.error('Error stack:', error.stack);
    res.json({ 
      response: "Sorry, I encountered an error. Please try again later. 😔\n\nIn the meantime, here's a helpful tip:\n\n**Always use `const` for variables that won't be reassigned, and `let` for variables that will change. Avoid `var` in modern JavaScript.**"
    });
  }
});

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
    await saveMessage(user.room, botName, `${user.username} has joined the chat`, null, 'system', joinMsg.time);

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
    await saveMessage(user.room, user.username, msg, null, 'text', message.time);
    
    // Optional: Clean old messages periodically (keep last 1000)
    // await cleanOldMessages(user.room, 1000);
  });

  // Listen for image messages
  socket.on("imageMessage", async ({ imageUrl, caption }) => {
    const user = getCurrentUser(socket.id);
    const messageId = `${user.room}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message = formatMessage(user.username, caption || '');
    message.id = messageId;
    message.imageUrl = imageUrl;
    message.messageType = 'image';
    message.isSuperuser = SUPERUSERS.includes(user.username);
    message.reactions = {};
    
    // Store message ID for tracking
    messageIds.set(messageId, { room: user.room, username: user.username, text: caption, imageUrl, time: message.time });
    
    io.to(user.room).emit("message", message);
    
    // Save image message to PostgreSQL
    await saveMessage(user.room, user.username, caption || '', imageUrl, 'image', message.time);
    
    console.log(`📸 Image shared by ${user.username} in ${user.room}`);
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
      await saveMessage(user.room, botName, `${user.username} has left the chat`, null, 'system', leaveMsg.time);

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
