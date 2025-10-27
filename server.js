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
  cleanOldMessages
} = require("./utils/database");
const {
  getAuth0Config,
  userInfoMiddleware,
  isAuth0Enabled,
  requiresAuth
} = require("./utils/auth");
require("dotenv").config();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

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

    socket.join(user.room);

    // Load and send message history from PostgreSQL
    try {
      const history = await getRoomMessages(user.room, 100);
      if (history.length > 0) {
        socket.emit("messageHistory", history);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    }

    // Welcome current user
    const welcomeMsg = formatMessage(botName, "Welcome to ChatCord!");
    socket.emit("message", welcomeMsg);

    // Broadcast when a user connects
    const joinMsg = formatMessage(botName, `${user.username} has joined the chat`);
    socket.broadcast.to(user.room).emit("message", joinMsg);
    
    // Save join message to PostgreSQL
    await saveMessage(user.room, botName, `${user.username} has joined the chat`, null, 'system', joinMsg.time);

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);

    const message = formatMessage(user.username, msg);
    io.to(user.room).emit("message", message);
    
    // Save message to PostgreSQL
    await saveMessage(user.room, user.username, msg, null, 'text', message.time);
    
    // Optional: Clean old messages periodically (keep last 1000)
    // await cleanOldMessages(user.room, 1000);
  });

  // Runs when client disconnects
  socket.on("disconnect", async () => {
    const user = userLeave(socket.id);

    if (user) {
      const leaveMsg = formatMessage(botName, `${user.username} has left the chat`);
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
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
