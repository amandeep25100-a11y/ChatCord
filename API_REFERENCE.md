# ChatCord API Reference

## 📡 Complete API Documentation

This document details all HTTP endpoints, Socket.IO events, and real-time communication protocols used in ChatCord.

---

## 🌐 HTTP REST API Endpoints

### Base URL
```
Development: http://localhost:3000
Production:  https://your-app.onrender.com
```

---

### Authentication Endpoints (Auth0)

#### **GET** `/login`
Redirects user to Auth0 login page.

**Authentication:** Not required  
**Query Parameters:** None

**Response:**
- `302 Redirect` to Auth0 Universal Login page

**Example:**
```bash
curl -X GET http://localhost:3000/login
```

**Flow:**
1. User clicks "Login" button
2. Redirects to Auth0 login page
3. User authenticates
4. Auth0 redirects back to `/callback`
5. Session created, redirects to `/`

---

#### **GET** `/logout`
Clears Auth0 session and logs user out.

**Authentication:** Not required  
**Query Parameters:** None

**Response:**
- `302 Redirect` to homepage (`/`)

**Example:**
```bash
curl -X GET http://localhost:3000/logout
```

**Effect:**
- Clears `req.oidc` session
- Destroys cookies
- Redirects to index.html

---

#### **GET** `/profile`
Returns authenticated user's profile information.

**Authentication:** Required (Auth0)  
**Query Parameters:** None

**Response:**
```json
{
  "sub": "auth0|1234567890",
  "nickname": "john_doe",
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "email": "john@example.com",
  "email_verified": true
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/profile \
  -H "Cookie: appSession=..."
```

**Error Response:**
- `401 Unauthorized` if not logged in
- Redirect to `/login`

---

#### **GET** `/api/user`
Check if user is authenticated and return user info.

**Authentication:** Not required  
**Query Parameters:** None

**Response (Authenticated):**
```json
{
  "user": {
    "sub": "auth0|1234567890",
    "nickname": "john_doe",
    "name": "John Doe",
    "picture": "https://example.com/avatar.jpg",
    "email": "john@example.com"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "user": null
}
```

**Example:**
```javascript
fetch('/api/user')
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      console.log('Logged in as:', data.user.name);
      // Pre-fill username input
      document.getElementById('username').value = data.user.nickname;
    } else {
      console.log('Not logged in');
    }
  });
```

**Usage:**
- Called on `index.html` page load
- Determines whether to show login button or profile
- Pre-fills username if authenticated

---

### Static File Endpoints

#### **GET** `/`
Serves the main landing page.

**Authentication:** Not required  
**Response:** `public/index.html`

**Features:**
- Username input form
- Auth0 login/logout buttons (if configured)
- Theme toggle
- Animated loading screen

---

#### **GET** `/rooms.html`
Serves the room selection page.

**Authentication:** Not required  
**Query Parameters:**
- `username` (required) - User's display name

**Response:** `public/rooms.html`

**Example:**
```
http://localhost:3000/rooms.html?username=JohnDoe
```

**Features:**
- 6 language-specific room tiles
- User count per room (static)
- Click to join room

---

#### **GET** `/chat.html`
Serves the chat interface.

**Authentication:** Not required  
**Query Parameters:**
- `username` (required) - User's display name
- `room` (required) - Room name to join

**Response:** `public/chat.html`

**Example:**
```
http://localhost:3000/chat.html?username=JohnDoe&room=JavaScript
```

**Features:**
- Real-time message display
- User list sidebar
- Message input field
- Emoji reactions
- Message deletion (authorized users)

---

#### **GET** `/css/style.css`
Serves the application stylesheet.

**Authentication:** Not required  
**Response:** `public/css/style.css` (CSS file)

---

#### **GET** `/js/main.js`
Serves the client-side JavaScript.

**Authentication:** Not required  
**Response:** `public/js/main.js` (JavaScript file)

---

## ⚡ Socket.IO Real-Time API

### Connection URL
```javascript
const socket = io(); // Auto-detects server URL
```

**Protocols:**
- Development: `ws://localhost:3000`
- Production: `wss://your-app.onrender.com` (secure WebSocket)

---

### Client → Server Events

These events are emitted from the client to the server.

---

#### **Event:** `joinRoom`

**Description:** User joins a chat room.

**Payload:**
```javascript
{
  username: String,  // User's display name
  room: String       // Room name (e.g., "JavaScript")
}
```

**Example:**
```javascript
socket.emit('joinRoom', { 
  username: 'JohnDoe', 
  room: 'JavaScript' 
});
```

**Server Actions:**
1. Add user to in-memory `users` array
2. Join Socket.IO room (for broadcasting)
3. Check if user is superuser
4. Load last 100 messages from database
5. Send message history to user
6. Send welcome message (private)
7. Broadcast join message to room
8. Update user list for all in room

**Server Response Events:**
- `superuserStatus` - Admin status notification
- `messageHistory` - Array of past messages
- `message` - Welcome message
- `roomUsers` - Updated user list

---

#### **Event:** `chatMessage`

**Description:** User sends a text message to the room.

**Payload:**
```javascript
String  // Message text content
```

**Example:**
```javascript
socket.emit('chatMessage', 'Hello, everyone!');
```

**Validation:**
- Empty messages are ignored client-side
- No length limit enforced (consider adding)

**Server Actions:**
1. Get user info from socket ID
2. Generate unique message ID
3. Format message with timestamp
4. Add superuser flag if applicable
5. Store in tracking Maps
6. Broadcast to all users in room
7. Save to PostgreSQL database

**Server Response Events:**
- `message` - Broadcast to entire room

**Message Structure:**
```javascript
{
  username: 'JohnDoe',
  text: 'Hello, everyone!',
  time: '3:45 pm',
  id: 'JavaScript-1730000000-abc123',
  isSuperuser: false,
  reactions: {}
}
```

---

#### **Event:** `addReaction`

**Description:** User adds or removes an emoji reaction on a message.

**Payload:**
```javascript
{
  messageId: String,  // Unique message identifier
  emoji: String,      // Emoji character (e.g., "❤️")
  username: String    // User adding reaction
}
```

**Example:**
```javascript
socket.emit('addReaction', { 
  messageId: 'JavaScript-1730000000-abc123', 
  emoji: '❤️',
  username: 'JohnDoe'
});
```

**Available Emojis:**
```javascript
['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯', '✅', '⭐']
```

**Toggle Behavior:**
- If user already reacted: Remove reaction
- If user hasn't reacted: Add reaction
- Multiple users can use same emoji
- One user can use multiple emojis

**Server Actions:**
1. Get message metadata from tracking Map
2. Get or create reactions object
3. Check if user already reacted
4. Toggle user in emoji array
5. Update reactions Map
6. Broadcast to room

**Server Response Events:**
- `emojiReaction` - Update for all users

---

#### **Event:** `deleteMessage`

**Description:** Delete a message (owner or superuser only).

**Payload:**
```javascript
{
  messageId: String  // Unique message identifier
}
```

**Example:**
```javascript
socket.emit('deleteMessage', { 
  messageId: 'JavaScript-1730000000-abc123'
});
```

**Authorization:**
| User Type | Own Messages | Others' Messages |
|-----------|--------------|------------------|
| Regular   | ✅ Yes       | ❌ No            |
| Superuser | ✅ Yes       | ✅ Yes           |

**Server Actions:**
1. Get current user from socket ID
2. Get message metadata (owner, room)
3. **Authorization check:**
   - Is user the message owner? OR
   - Is user a superuser?
4. If authorized:
   - Remove from tracking Maps
   - Broadcast deletion to room
5. If unauthorized:
   - Silent fail (no response)

**Server Response Events:**
- `messageDeleted` - Broadcast if authorized

**Note:** Database records are NOT deleted (audit trail preserved).

---

#### **Event:** `disconnect`

**Description:** User closes connection (browser close, navigate away, etc.).

**Payload:** None (automatic Socket.IO event)

**Example:**
```javascript
// Triggered automatically when user closes tab/browser
// No manual emit needed
```

**Server Actions:**
1. Find user by socket ID
2. Remove from `users` array
3. Create leave message
4. Broadcast to room
5. Save leave message to database
6. Update user list for room

**Server Response Events:**
- `message` - Leave notification
- `roomUsers` - Updated user list

---

### Server → Client Events

These events are emitted from the server to the client(s).

---

#### **Event:** `message`

**Description:** New message to display in chat.

**Payload:**
```javascript
{
  username: String,      // Sender's name
  text: String,          // Message content
  time: String,          // Formatted time (e.g., "3:45 pm")
  id: String,            // Unique message ID (optional)
  isSuperuser: Boolean,  // Admin badge flag (optional)
  reactions: Object      // Emoji reactions (optional)
}
```

**Types of Messages:**
1. **User Message** - Regular chat message
2. **System Message** - Join/leave notifications (username = "ChatCord Bot")
3. **Welcome Message** - Private message on join

**Example:**
```javascript
socket.on('message', (message) => {
  console.log(`${message.username}: ${message.text}`);
  outputMessage(message); // Render in UI
});
```

**System Message Example:**
```javascript
{
  username: 'ChatCord Bot',
  text: 'JohnDoe has joined the chat',
  time: '3:45 pm'
}
```

**Broadcast Scope:**
- **Welcome message**: Private (only to joining user)
- **User messages**: Entire room (including sender)
- **Join/Leave**: Entire room (excluding target user for welcome)

---

#### **Event:** `messageHistory`

**Description:** Past messages loaded on room join.

**Payload:**
```javascript
Array<{
  username: String,
  text: String,
  time: String,
  id: String,
  isSuperuser: Boolean,
  reactions: Object
}>
```

**Example:**
```javascript
socket.on('messageHistory', (messages) => {
  messages.forEach(msg => {
    outputMessage(msg);
  });
});
```

**Characteristics:**
- Loads last 100 messages per room
- Sorted oldest to newest
- Includes emoji reactions from current session
- Excludes reactions from previous sessions (volatile)

**Sample Payload:**
```javascript
[
  {
    username: 'Alice',
    text: 'Hello!',
    time: '2:30 pm',
    id: 'JavaScript-1730000000-abc111',
    isSuperuser: false,
    reactions: {}
  },
  {
    username: 'admin',
    text: 'Welcome everyone',
    time: '2:31 pm',
    id: 'JavaScript-1730000001-abc222',
    isSuperuser: true,
    reactions: {
      '👍': ['Alice', 'Bob'],
      '❤️': ['Charlie']
    }
  }
]
```

---

#### **Event:** `roomUsers`

**Description:** Updated list of active users in room.

**Payload:**
```javascript
{
  room: String,        // Room name
  users: Array<{       // Active users
    id: String,        // Socket ID
    username: String,  // Display name
    room: String       // Room name
  }>
}
```

**Example:**
```javascript
socket.on('roomUsers', ({ room, users }) => {
  document.getElementById('room-name').innerText = room;
  
  const userList = document.getElementById('users');
  userList.innerHTML = users.map(user => 
    `<li>${user.username}</li>`
  ).join('');
});
```

**Triggered When:**
- User joins room
- User leaves room (disconnect)

**Sample Payload:**
```javascript
{
  room: 'JavaScript',
  users: [
    { id: 'socket-abc123', username: 'Alice', room: 'JavaScript' },
    { id: 'socket-def456', username: 'Bob', room: 'JavaScript' },
    { id: 'socket-ghi789', username: 'admin', room: 'JavaScript' }
  ]
}
```

---

#### **Event:** `emojiReaction`

**Description:** Real-time emoji reaction update.

**Payload:**
```javascript
{
  messageId: String,     // Target message ID
  emoji: String,         // Emoji character
  username: String,      // User who reacted
  reactions: Array       // All users who reacted with this emoji
}
```

**Example:**
```javascript
socket.on('emojiReaction', ({ messageId, emoji, username, reactions }) => {
  updateReaction(messageId, emoji, reactions);
});
```

**Behavior:**
- If `reactions` array is empty: Remove reaction bubble
- If `reactions` has users: Show/update count
- Highlight bubble if current user is in array

**Sample Payload (Add Reaction):**
```javascript
{
  messageId: 'JavaScript-1730000000-abc123',
  emoji: '❤️',
  username: 'Alice',
  reactions: ['Alice', 'Bob', 'Charlie']  // 3 users reacted
}
```

**Sample Payload (Remove Reaction):**
```javascript
{
  messageId: 'JavaScript-1730000000-abc123',
  emoji: '❤️',
  username: 'Alice',
  reactions: ['Bob', 'Charlie']  // Alice removed her reaction
}
```

---

#### **Event:** `messageDeleted`

**Description:** Message has been deleted and should be removed from UI.

**Payload:**
```javascript
{
  messageId: String  // ID of deleted message
}
```

**Example:**
```javascript
socket.on('messageDeleted', ({ messageId }) => {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageEl) {
    messageEl.remove();
  }
});
```

**Triggered By:**
- Message owner clicking delete
- Superuser deleting any message

**Note:** Database message remains (audit trail), only removed from client UI and tracking Maps.

---

#### **Event:** `superuserStatus`

**Description:** Notifies user if they have admin privileges.

**Payload:**
```javascript
{
  isSuperuser: Boolean  // true if user is in SUPERUSERS env variable
}
```

**Example:**
```javascript
socket.on('superuserStatus', ({ isSuperuser }) => {
  localStorage.setItem('isSuperuser', isSuperuser);
  
  if (isSuperuser) {
    console.log('🔐 Superuser privileges enabled');
    // Show delete buttons on all messages
  }
});
```

**Privileges:**
- Delete any message in any room
- Red "ADMIN" badge displayed
- Client stores status in `localStorage`

**Configuration:**
```env
# .env file
SUPERUSERS=admin,moderator,superuser
```

---

## 🗄️ Database Schema

### Table: `messages`

**Description:** Stores all chat messages for persistence and history.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Auto-incrementing ID |
| `room` | `VARCHAR(100)` | NOT NULL | Room name |
| `username` | `VARCHAR(100)` | NOT NULL | Sender username |
| `text` | `TEXT` | NOT NULL | Message content |
| `message_id` | `VARCHAR(255)` | - | Unique client-side ID |
| `message_type` | `VARCHAR(50)` | DEFAULT 'text' | 'text', 'system', 'join' |
| `timestamp` | `TIMESTAMP` | DEFAULT NOW() | Message creation time |

**Indexes:**
```sql
CREATE INDEX idx_room ON messages(room);
CREATE INDEX idx_timestamp ON messages(timestamp DESC);
```

**SQL Schema:**
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  message_id VARCHAR(255),
  message_type VARCHAR(50) DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Query Examples:**

```sql
-- Get last 100 messages for a room
SELECT username, text, message_id, message_type, 
       TO_CHAR(timestamp, 'HH12:MI AM') as time 
FROM messages 
WHERE room = 'JavaScript' 
ORDER BY timestamp DESC 
LIMIT 100;

-- Insert new message
INSERT INTO messages (room, username, text, message_id, message_type) 
VALUES ('JavaScript', 'JohnDoe', 'Hello!', 'JS-1730000000-abc123', 'text');

-- Count messages per room
SELECT room, COUNT(*) as message_count 
FROM messages 
GROUP BY room;
```

---

## 🔐 Authentication Flow

### Auth0 OpenID Connect Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks "Login" button                              │
│     GET /login                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Server redirects to Auth0                               │
│     302 → https://your-domain.auth0.com/authorize           │
│     Parameters:                                             │
│       - response_type=code                                  │
│       - client_id=YOUR_CLIENT_ID                            │
│       - redirect_uri=http://localhost:3000/callback         │
│       - scope=openid profile email                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. User authenticates with Auth0                           │
│     - Email/password                                        │
│     - Social login (Google, GitHub, etc.)                   │
│     - Passwordless (magic link, SMS)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Auth0 redirects back with authorization code            │
│     GET /callback?code=AUTHORIZATION_CODE                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. express-openid-connect exchanges code for tokens        │
│     - Access token                                          │
│     - ID token (JWT with user info)                         │
│     - Refresh token                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Server creates session                                  │
│     - Stores tokens in encrypted cookie                     │
│     - Sets req.oidc.user                                    │
│     - Redirects to /                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  7. User lands on index.html (authenticated)                │
│     - Profile picture shown                                 │
│     - Username pre-filled from Auth0 profile                │
│     - "Logout" button available                             │
└─────────────────────────────────────────────────────────────┘
```

**Token Structure (ID Token - JWT):**
```json
{
  "sub": "auth0|1234567890",
  "nickname": "john_doe",
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "email": "john@example.com",
  "email_verified": true,
  "iat": 1730000000,
  "exp": 1730086400
}
```

---

## 🔄 Complete User Journey API Calls

### Journey: User Joins Chat and Sends Message

```
┌──────────────────────────────────────────────────────────┐
│  Step 1: Load Index Page                                │
├──────────────────────────────────────────────────────────┤
│  HTTP GET /                                              │
│  Response: index.html                                    │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 2: Check Authentication                            │
├──────────────────────────────────────────────────────────┤
│  HTTP GET /api/user                                      │
│  Response: { "user": null }  (not logged in)             │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 3: Submit Username                                 │
├──────────────────────────────────────────────────────────┤
│  Browser Navigation: /rooms.html?username=JohnDoe        │
│  HTTP GET /rooms.html                                    │
│  Response: rooms.html                                    │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 4: Select Room                                     │
├──────────────────────────────────────────────────────────┤
│  Browser Navigation: /chat.html?username=JohnDoe&        │
│                      room=JavaScript                     │
│  HTTP GET /chat.html                                     │
│  Response: chat.html                                     │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 5: Establish WebSocket Connection                 │
├──────────────────────────────────────────────────────────┤
│  WebSocket: ws://localhost:3000                          │
│  Socket.IO handshake                                     │
│  Connection established                                  │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 6: Join Room                                       │
├──────────────────────────────────────────────────────────┤
│  EMIT 'joinRoom'                                         │
│  { username: 'JohnDoe', room: 'JavaScript' }             │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Server Response Events                                  │
├──────────────────────────────────────────────────────────┤
│  ON 'superuserStatus' { isSuperuser: false }             │
│  ON 'messageHistory' [ ...past messages ]                │
│  ON 'message' { ...welcome message }                     │
│  ON 'roomUsers' { room: 'JavaScript', users: [...] }     │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Step 7: Send Message                                    │
├──────────────────────────────────────────────────────────┤
│  EMIT 'chatMessage' 'Hello everyone!'                    │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Server Broadcast to Room                                │
├──────────────────────────────────────────────────────────┤
│  ON 'message' {                                          │
│    username: 'JohnDoe',                                  │
│    text: 'Hello everyone!',                              │
│    time: '3:45 pm',                                      │
│    id: 'JavaScript-1730000000-abc123',                   │
│    isSuperuser: false,                                   │
│    reactions: {}                                         │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Error Handling

### HTTP Errors

| Status Code | Description | Example |
|-------------|-------------|---------|
| `401 Unauthorized` | Not authenticated (Auth0) | Accessing `/profile` without login |
| `404 Not Found` | Route doesn't exist | GET `/nonexistent` |
| `500 Internal Server Error` | Server crash | Database connection failure |

**Example Error Response:**
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to access this resource"
}
```

---

### Socket.IO Errors

**Connection Errors:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  // Show "Unable to connect" message to user
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forcibly disconnected (kicked)
    console.log('You were disconnected by the server');
  } else if (reason === 'transport close') {
    // Network issue
    console.log('Connection lost, reconnecting...');
  }
});
```

**Reconnection:**
```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Re-join room
  socket.emit('joinRoom', { username, room });
});
```

---

## 📊 Rate Limiting (Not Implemented)

**Recommended Limits:**
```javascript
// Messages per user
5 messages per second
50 messages per minute

// Reactions per user
10 reactions per second

// Room joins
1 join per 2 seconds
```

**Implementation Example:**
```javascript
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // 5 requests
  message: 'Too many messages, please slow down'
});

app.post('/api/message', chatLimiter, (req, res) => {
  // Handle message
});
```

---

## 🧪 Testing Endpoints

### Testing with cURL

**Test user endpoint:**
```bash
curl -X GET http://localhost:3000/api/user
```

**Test with authentication cookie:**
```bash
curl -X GET http://localhost:3000/profile \
  -H "Cookie: appSession=eyJhbGci..."
```

---

### Testing with Postman

**Collection Structure:**
```
ChatCord API
├── GET /
├── GET /api/user
├── GET /login
├── GET /logout
└── GET /profile (requires Auth0 cookie)
```

---

### Testing Socket.IO Events

**Using Socket.IO Client:**
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Join room
  socket.emit('joinRoom', { 
    username: 'TestUser', 
    room: 'JavaScript' 
  });
});

socket.on('message', (message) => {
  console.log('Received:', message);
});

socket.on('messageHistory', (history) => {
  console.log('History:', history.length, 'messages');
});

// Send test message
setTimeout(() => {
  socket.emit('chatMessage', 'Test message from script');
}, 2000);
```

---

## 📚 API Versioning

**Current Version:** `v1` (implicit, no version in URL)

**Future Versioning Strategy:**
```
/api/v1/user
/api/v1/rooms
/api/v2/user  (when breaking changes occur)
```

---

## 🔒 Security Considerations

### Input Validation
- **Message text**: No validation (consider max length)
- **Username**: No validation (consider alphanumeric + length)
- **Room name**: Validated against allowed rooms client-side

### SQL Injection Prevention
```javascript
// ❌ VULNERABLE
await pool.query(`SELECT * FROM messages WHERE room = '${room}'`);

// ✅ SAFE (Parameterized)
await pool.query('SELECT * FROM messages WHERE room = $1', [room]);
```

### CORS (Cross-Origin Resource Sharing)
```javascript
// Currently: Same-origin only
// For cross-domain: Enable CORS middleware
const cors = require('cors');
app.use(cors({
  origin: 'https://trusted-domain.com',
  credentials: true
}));
```

---

## 📖 Additional Resources

- **Socket.IO Docs**: https://socket.io/docs/v4/
- **Express.js Docs**: https://expressjs.com/
- **Auth0 Docs**: https://auth0.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

This API reference provides complete documentation for all endpoints and events in the ChatCord application. Use this as a guide for integration, testing, and extending functionality. 🚀
