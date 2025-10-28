# ChatCord Backend Documentation

## 🔧 Backend Architecture Overview

ChatCord's backend is built on **Node.js** with **Express.js** for HTTP routing and **Socket.IO** for real-time bidirectional communication. The server handles user authentication, message persistence, room management, and real-time event broadcasting.

---

## 📦 Technology Stack

### Core Dependencies
```json
{
  "express": "^4.18.2",           // Web framework
  "socket.io": "^4.5.4",          // Real-time WebSocket communication
  "pg": "^8.8.0",                 // PostgreSQL client
  "dotenv": "^16.0.3",            // Environment configuration
  "express-openid-connect": "^2.11.0", // Auth0 integration
  "moment": "^2.29.4"             // Date/time formatting
}
```

### Development Dependencies
```json
{
  "nodemon": "^2.0.20",           // Auto-restart on file changes
  "cross-env": "^7.0.3"           // Cross-platform env variables
}
```

---

## 🗂️ Project Structure

```
server.js                 # Main server entry point
utils/
  ├── users.js           # In-memory user management
  ├── messages.js        # Message formatting utilities
  └── database.js        # PostgreSQL connection & queries
.env                     # Environment variables
package.json             # Dependencies & scripts
schema.sql               # Database schema
```

---

## 🚀 Server Initialization (`server.js`)

### 1. Setup & Configuration

```javascript
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
```

**Key Points:**
- Express app wrapped in HTTP server for Socket.IO compatibility
- Environment variables loaded via `dotenv`
- Default port 3000, overridable via `PORT` env variable

---

### 2. Middleware Stack

```javascript
// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth0 (optional)
const { auth } = require('express-openid-connect');
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
}));
```

**Middleware Order:**
1. JSON body parser (for API requests)
2. URL-encoded body parser (for forms)
3. Static file serving (`/public` directory)
4. Auth0 authentication (optional, works without it)

---

### 3. Database Initialization

```javascript
const { initDatabase, saveMessage, getRoomMessages } = require('./utils/database');

// Initialize on startup
initDatabase()
  .then(() => console.log('✅ Database initialized'))
  .catch(err => console.error('❌ Database init failed:', err));
```

**Error Handling:**
- Non-blocking: App continues if database fails
- Graceful degradation: In-memory mode still works
- Logs errors for debugging

---

## 🔐 Authentication System

### Auth0 Integration (Optional)

#### Routes

```javascript
// Login - redirects to Auth0
app.get('/login', (req, res) => {
  res.oidc.login({ returnTo: '/' });
});

// Logout - clears session
app.get('/logout', (req, res) => {
  res.oidc.logout({ returnTo: '/' });
});

// Profile - user info
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// API endpoint for client-side checks
app.get('/api/user', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json({ user: req.oidc.user });
  } else {
    res.json({ user: null });
  }
});
```

**Flow:**
1. Client checks `/api/user` on page load
2. If authenticated: Show profile, pre-fill username
3. If not authenticated: Show login button
4. Works without Auth0: Users just enter username

---

### Superuser System

```javascript
const SUPERUSERS = process.env.SUPERUSERS 
  ? process.env.SUPERUSERS.split(',').map(u => u.trim())
  : [];

console.log('🔐 Superusers:', SUPERUSERS);
```

**Configuration:**
```env
# .env file
SUPERUSERS=admin,moderator,superuser
```

**Authorization Check:**
```javascript
function isSuperuser(username) {
  return SUPERUSERS.includes(username);
}
```

**Privileges:**
- Delete any message in any room
- Identified by red "ADMIN" badge
- Stored in client `localStorage` on join

---

## 👥 User Management (`utils/users.js`)

### In-Memory User Array

```javascript
const users = [];

// Add user to room
function userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

// Get current user by socket ID
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves room
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get all users in room
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}
```

**Characteristics:**
- **Volatile**: Users lost on server restart
- **Fast**: O(1) add, O(n) search
- **Simple**: No database overhead
- **Scalable**: Works for small-medium deployments

**Data Structure:**
```javascript
users = [
  { id: 'socket-abc123', username: 'john', room: 'JavaScript' },
  { id: 'socket-def456', username: 'jane', room: 'Python' },
  { id: 'socket-ghi789', username: 'admin', room: 'JavaScript' }
]
```

---

## 💬 Message System

### Message Formatting (`utils/messages.js`)

```javascript
const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')  // "3:45 pm"
  };
}

module.exports = formatMessage;
```

**Enhanced Format (in server.js):**
```javascript
const message = {
  ...formatMessage(user.username, msg),
  id: messageId,                    // Unique identifier
  isSuperuser: isSuperuser(user.username), // Admin badge
  reactions: {}                     // Emoji reactions
};
```

---

### Message Tracking (In-Memory)

```javascript
// Track message metadata for reactions/deletion
const messageIds = new Map();

// Track reactions per message
const messageReactions = new Map();

// Store message metadata
messageIds.set(messageId, {
  room: user.room,
  username: user.username,
  text: msg,
  time: moment().format('h:mm a')
});

// Initialize reactions
messageReactions.set(messageId, {});
```

**Why Maps?**
- O(1) lookup by message ID
- Easy to check existence
- Memory efficient for active messages
- Volatile (cleared on restart)

---

## 🗄️ Database Layer (`utils/database.js`)

### PostgreSQL Setup

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});
```

**Connection Pooling:**
- Reuses connections for efficiency
- Default max: 10 concurrent connections
- Auto-reconnects on failure
- SSL enabled in production (Render)

---

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  room VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  message_id VARCHAR(255),
  message_type VARCHAR(50) DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room ON messages(room);
CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp DESC);
```

**Schema Design:**
- **id**: Auto-incrementing primary key
- **room**: Room name (e.g., "JavaScript")
- **username**: Sender username
- **text**: Message content
- **message_id**: Unique ID for client-side tracking
- **message_type**: 'text', 'system', or 'join'
- **timestamp**: Message creation time

**Indexes:**
- `idx_room`: Fast queries by room
- `idx_timestamp`: Efficient history loading (DESC order)

---

### Database Operations

#### Initialize Database
```javascript
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        message_id VARCHAR(255),
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_room ON messages(room)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp DESC)');
    
    client.release();
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}
```

---

#### Save Message
```javascript
async function saveMessage(room, username, text, messageId, messageType = 'text', time) {
  try {
    await pool.query(
      `INSERT INTO messages (room, username, text, message_id, message_type, timestamp) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [room, username, text, messageId, messageType]
    );
  } catch (err) {
    console.error('❌ Save message error:', err);
  }
}
```

**Parameterized Queries:**
- Prevents SQL injection
- Type-safe bindings
- Better performance (query plan caching)

---

#### Get Room Messages
```javascript
async function getRoomMessages(room, limit = 100) {
  try {
    const result = await pool.query(
      `SELECT username, text, message_id, message_type, 
              TO_CHAR(timestamp, 'HH12:MI AM') as time 
       FROM messages 
       WHERE room = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [room, limit]
    );
    
    return result.rows.reverse(); // Oldest first for display
  } catch (err) {
    console.error('❌ Get messages error:', err);
    return [];
  }
}
```

**Query Features:**
- Loads last N messages (default 100)
- Formats timestamp as "3:45 PM"
- Returns oldest first (reversed after query)
- Includes message ID for client tracking

---

## ⚡ Socket.IO Event System

### Connection Lifecycle

```javascript
io.on('connection', socket => {
  console.log('🔌 New connection:', socket.id);
  
  // User joins room
  socket.on('joinRoom', ({ username, room }) => { /* ... */ });
  
  // User sends message
  socket.on('chatMessage', msg => { /* ... */ });
  
  // User adds reaction
  socket.on('addReaction', ({ messageId, emoji, username }) => { /* ... */ });
  
  // User deletes message
  socket.on('deleteMessage', ({ messageId }) => { /* ... */ });
  
  // User disconnects
  socket.on('disconnect', () => { /* ... */ });
});
```

---

### Event: `joinRoom`

```javascript
socket.on('joinRoom', async ({ username, room }) => {
  // 1. Add user to in-memory store
  const user = userJoin(socket.id, username, room);
  socket.join(user.room);
  
  // 2. Check if superuser
  const userIsSuperuser = isSuperuser(user.username);
  socket.emit('superuserStatus', { isSuperuser: userIsSuperuser });
  
  // 3. Load message history from database
  const history = await getRoomMessages(user.room, 100);
  
  // 4. Enrich history with reactions and superuser flags
  const enrichedHistory = history.map(msg => {
    const messageId = msg.message_id;
    const reactions = messageReactions.get(messageId) || {};
    return {
      username: msg.username,
      text: msg.text,
      time: msg.time,
      id: messageId,
      isSuperuser: isSuperuser(msg.username),
      reactions: reactions
    };
  });
  
  // 5. Send history to user
  socket.emit('messageHistory', enrichedHistory);
  
  // 6. Welcome message (private)
  socket.emit('message', formatMessage(botName, `Welcome to ${user.room}!`));
  
  // 7. Broadcast join to others
  socket.broadcast
    .to(user.room)
    .emit('message', formatMessage(botName, `${user.username} has joined the chat`));
  
  // 8. Save join message to database
  await saveMessage(
    user.room, 
    botName, 
    `${user.username} has joined the chat`,
    `${user.room}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    'system'
  );
  
  // 9. Update user list for everyone in room
  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  });
});
```

**Execution Flow:**
1. Store user in memory
2. Join Socket.IO room (for broadcasting)
3. Check superuser status
4. Load last 100 messages from database
5. Add real-time reaction data
6. Send history to new user
7. Welcome message (private)
8. Announce join (broadcast)
9. Update user list

---

### Event: `chatMessage`

```javascript
socket.on('chatMessage', async msg => {
  // 1. Get user info
  const user = getCurrentUser(socket.id);
  if (!user) return;
  
  // 2. Generate unique message ID
  const messageId = `${user.room}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 3. Format message
  const formattedMsg = formatMessage(user.username, msg);
  const message = {
    ...formattedMsg,
    id: messageId,
    isSuperuser: isSuperuser(user.username),
    reactions: {}
  };
  
  // 4. Store metadata for reactions/deletion
  messageIds.set(messageId, {
    room: user.room,
    username: user.username,
    text: msg,
    time: formattedMsg.time
  });
  
  // 5. Initialize reactions map
  messageReactions.set(messageId, {});
  
  // 6. Broadcast to room
  io.to(user.room).emit('message', message);
  
  // 7. Save to database
  await saveMessage(
    user.room, 
    user.username, 
    msg, 
    messageId, 
    'text', 
    formattedMsg.time
  );
});
```

**Message ID Format:**
```
JavaScript-1730123456789-abc123def
[room]-[timestamp]-[random]
```

**Broadcast vs Emit:**
- `io.to(room).emit()`: Sends to ALL users in room (including sender)
- `socket.broadcast.to(room).emit()`: Sends to everyone EXCEPT sender

---

### Event: `addReaction`

```javascript
socket.on('addReaction', ({ messageId, emoji, username }) => {
  // 1. Get message metadata
  const messageData = messageIds.get(messageId);
  if (!messageData) return;
  
  // 2. Get reactions for this message
  let reactions = messageReactions.get(messageId) || {};
  
  // 3. Initialize emoji array if needed
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }
  
  // 4. Toggle reaction (add or remove)
  const userIndex = reactions[emoji].indexOf(username);
  if (userIndex > -1) {
    // Remove reaction
    reactions[emoji].splice(userIndex, 1);
    
    // Clean up empty emoji arrays
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  } else {
    // Add reaction
    reactions[emoji].push(username);
  }
  
  // 5. Update storage
  messageReactions.set(messageId, reactions);
  
  // 6. Broadcast to room
  io.to(messageData.room).emit('emojiReaction', {
    messageId,
    emoji,
    username,
    reactions: reactions[emoji] || []
  });
});
```

**Reaction Toggle Logic:**
- If user already reacted: Remove (un-react)
- If user hasn't reacted: Add (react)
- Multiple users can react with same emoji
- User can react with multiple emojis

**Data Structure:**
```javascript
messageReactions = {
  'JS-1730000000-abc123': {
    '❤️': ['john', 'jane', 'admin'],
    '👍': ['bob', 'alice'],
    '🎉': ['jane']
  }
}
```

---

### Event: `deleteMessage`

```javascript
socket.on('deleteMessage', ({ messageId }) => {
  // 1. Get current user
  const user = getCurrentUser(socket.id);
  if (!user) return;
  
  // 2. Get message metadata
  const messageData = messageIds.get(messageId);
  if (!messageData) return;
  
  // 3. Authorization check
  const isOwner = messageData.username === user.username;
  const isAdmin = isSuperuser(user.username);
  
  if (!isOwner && !isAdmin) {
    console.log('❌ Unauthorized delete attempt:', user.username);
    return;
  }
  
  // 4. Remove from tracking
  messageIds.delete(messageId);
  messageReactions.delete(messageId);
  
  // 5. Broadcast deletion
  io.to(messageData.room).emit('messageDeleted', { messageId });
  
  console.log('🗑️ Message deleted:', messageId, 'by', user.username);
});
```

**Authorization Matrix:**
| User Type | Can Delete Own | Can Delete Others |
|-----------|---------------|-------------------|
| Regular User | ✅ Yes | ❌ No |
| Superuser | ✅ Yes | ✅ Yes |

**Note:** Database messages are NOT deleted (audit trail preserved)

---

### Event: `disconnect`

```javascript
socket.on('disconnect', async () => {
  // 1. Remove user from memory
  const user = userLeave(socket.id);
  
  if (user) {
    // 2. Announce departure
    const leaveMsg = formatMessage(botName, `${user.username} has left the chat`);
    io.to(user.room).emit('message', leaveMsg);
    
    // 3. Save to database
    await saveMessage(
      user.room,
      botName,
      `${user.username} has left the chat`,
      `${user.room}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      'system'
    );
    
    // 4. Update user list
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  }
  
  console.log('🔌 User disconnected:', socket.id);
});
```

**Cleanup Actions:**
1. Remove from `users` array
2. Broadcast leave message
3. Save to database (history)
4. Update user list for room

---

## 🔄 Message Flow Example

### Complete Flow: User Sends Message

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. User types "Hello world"
       │    and presses Enter
       ▼
┌──────────────────────────────┐
│  socket.emit('chatMessage',  │
│    'Hello world')            │
└──────┬───────────────────────┘
       │
       │ WebSocket
       ▼
┌────────────────────────────────────────┐
│  Server: socket.on('chatMessage')      │
│                                        │
│  1. getCurrentUser(socket.id)         │
│     → { id: 'xyz', username: 'john',  │
│         room: 'JavaScript' }          │
│                                        │
│  2. Generate ID: 'JS-1730000000-abc'  │
│                                        │
│  3. formatMessage('john', 'Hello...')  │
│     → { username: 'john',             │
│         text: 'Hello world',          │
│         time: '3:45 pm' }             │
│                                        │
│  4. Add metadata:                     │
│     - id: 'JS-1730000000-abc'         │
│     - isSuperuser: false              │
│     - reactions: {}                   │
│                                        │
│  5. Store in messageIds Map           │
│                                        │
│  6. io.to('JavaScript')               │
│      .emit('message', message)        │
│                                        │
│  7. saveMessage(room, username, text) │
│     → INSERT INTO messages...         │
└────────┬───────────────────────────────┘
         │
         │ Broadcast to all in room
         ▼
┌────────────────────────────────┐
│  All Clients in JavaScript     │
│  room receive 'message' event  │
│                                │
│  outputMessage(message)        │
│  → Renders in chat UI          │
└────────────────────────────────┘
```

---

## 🔒 Security Features

### 1. SQL Injection Prevention
```javascript
// ❌ BAD - Vulnerable to SQL injection
await pool.query(`SELECT * FROM messages WHERE room = '${room}'`);

// ✅ GOOD - Parameterized query
await pool.query('SELECT * FROM messages WHERE room = $1', [room]);
```

### 2. Authorization Checks
```javascript
// Delete message - verify ownership or admin
if (!isOwner && !isAdmin) {
  return; // Silent fail, no error message
}
```

### 3. Input Validation (Client-Side)
```javascript
// Chat form validation
if (msg.trim() === '') {
  return; // Don't send empty messages
}
```

### 4. Environment Variables
```javascript
// Sensitive data in .env, not committed to Git
DATABASE_URL=postgresql://...
AUTH0_SECRET=your-secret-here
SUPERUSERS=admin,moderator
```

### 5. HTTPS/WSS in Production
```javascript
// Render automatically provides SSL
// WebSocket connections use wss:// (secure)
```

---

## 🧪 Error Handling

### Database Errors
```javascript
async function saveMessage(...) {
  try {
    await pool.query(...);
  } catch (err) {
    console.error('❌ Save message error:', err);
    // App continues, message just not persisted
  }
}
```

**Strategy:**
- Log errors for debugging
- Continue operation (graceful degradation)
- Don't crash server on database failure

---

### Socket Errors
```javascript
socket.on('error', (err) => {
  console.error('🔌 Socket error:', err);
});

io.on('error', (err) => {
  console.error('⚡ Socket.IO error:', err);
});
```

---

### Uncaught Exceptions
```javascript
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  // Log to monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection:', reason);
});
```

---

## 📊 Performance Optimizations

### 1. Database Indexing
```sql
CREATE INDEX idx_room ON messages(room);
CREATE INDEX idx_timestamp ON messages(timestamp DESC);
```

**Impact:**
- Room queries: O(log n) instead of O(n)
- History loading: Sorted by index, no table scan

---

### 2. Connection Pooling
```javascript
const pool = new Pool({
  max: 20,              // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

**Benefits:**
- Reuse connections (avoid handshake overhead)
- Limit concurrent queries
- Auto-reconnect on failure

---

### 3. Message History Limit
```javascript
// Only load last 100 messages per room
await getRoomMessages(room, 100);
```

**Rationale:**
- Reduces initial payload
- Faster room join
- Most users only read recent messages

---

### 4. In-Memory Caching
```javascript
// Active users in RAM (fast lookup)
const users = [];

// Recent reactions in RAM (volatile but fast)
const messageReactions = new Map();
```

**Trade-off:**
- Speed: O(1) lookups
- Persistence: Lost on restart (acceptable for reactions)

---

## 🚀 Deployment Configuration

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth0 (optional)
AUTH0_SECRET=your-secret-key
AUTH0_BASE_URL=https://your-app.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com

# Superusers
SUPERUSERS=admin,moderator,superuser
```

---

### Start Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Usage:**
- Development: `npm run dev` (auto-restart)
- Production: `npm start` (stable)

---

### Render Configuration
```yaml
# render.yaml
services:
  - type: web
    name: chatcord
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: chatcord-db
          property: connectionString
      - key: NODE_ENV
        value: production
```

---

## 🔍 Logging & Monitoring

### Console Logging
```javascript
console.log('🔌 New connection:', socket.id);
console.log('✅ Database initialized');
console.log('🗑️ Message deleted:', messageId);
console.error('❌ Database error:', err);
```

**Log Levels:**
- 🔌 Connection events
- ✅ Success operations
- 🗑️ User actions
- ❌ Errors

---

### Render Logs
```bash
# View live logs
render logs --tail

# View specific service
render logs --service chatcord

# Filter errors
render logs --level error
```

---

## 🧩 API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | Serve index.html | No |
| GET | `/rooms.html` | Serve rooms page | No |
| GET | `/chat.html` | Serve chat page | No |
| GET | `/api/user` | Get current user info | No |
| GET | `/login` | Redirect to Auth0 | No |
| GET | `/logout` | Clear Auth0 session | No |
| GET | `/profile` | Get Auth0 profile | Yes |

---

## 🔌 Socket.IO Events Summary

### Client → Server
| Event | Payload | Purpose |
|-------|---------|---------|
| `joinRoom` | `{ username, room }` | User joins chat room |
| `chatMessage` | `"message text"` | User sends message |
| `addReaction` | `{ messageId, emoji, username }` | Add/remove emoji reaction |
| `deleteMessage` | `{ messageId }` | Delete message (owner/admin) |

### Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `message` | `{ username, text, time, id, isSuperuser, reactions }` | New message |
| `messageHistory` | `[...messages]` | Load past messages |
| `roomUsers` | `{ room, users }` | Update user list |
| `emojiReaction` | `{ messageId, emoji, username, reactions }` | Reaction update |
| `messageDeleted` | `{ messageId }` | Message removed |
| `superuserStatus` | `{ isSuperuser }` | Admin status |

---

## 🎯 Best Practices Implemented

1. ✅ **Separation of Concerns**: Utils folder for reusable logic
2. ✅ **Environment Configuration**: `.env` for sensitive data
3. ✅ **Error Handling**: Try-catch blocks, graceful degradation
4. ✅ **Security**: Parameterized queries, authorization checks
5. ✅ **Scalability**: Connection pooling, indexing, in-memory caching
6. ✅ **Maintainability**: Clear function names, modular code
7. ✅ **Logging**: Descriptive console logs with emojis
8. ✅ **Real-time**: Socket.IO for instant updates
9. ✅ **Persistence**: PostgreSQL for message history
10. ✅ **Flexibility**: Works with or without Auth0

---

This backend architecture provides a solid foundation for a real-time chat application with room-based messaging, emoji reactions, message history, and admin controls. The system is designed to be simple, maintainable, and scalable for small to medium deployments. 🚀
