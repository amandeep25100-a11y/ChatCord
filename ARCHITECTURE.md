# ChatCord Architecture

## 🏗️ System Architecture Overview

ChatCord is a real-time chat application built with a modern event-driven architecture using WebSockets for bidirectional communication between clients and server.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  index.html  │  │  rooms.html  │  │  chat.html   │              │
│  │   (Login)    │─▶│ (Room Select)│─▶│ (Chat Room)  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                   ┌────────▼─────────┐                              │
│                   │   main.js        │                              │
│                   │ (Client Logic)   │                              │
│                   └────────┬─────────┘                              │
│                            │                                         │
│                   ┌────────▼─────────┐                              │
│                   │   Socket.IO      │                              │
│                   │   Client         │                              │
│                   └────────┬─────────┘                              │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                    WebSocket Connection
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                        SERVER LAYER                                   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Express.js Server                         │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐   │   │
│  │  │  Auth0        │  │  Static Files │  │  API Routes  │   │   │
│  │  │  Middleware   │  │  Serving      │  │  /login      │   │   │
│  │  └───────────────┘  └───────────────┘  │  /logout     │   │   │
│  │                                         │  /profile    │   │   │
│  └─────────────────────────────────────────┴──────────────┘   │   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Socket.IO Server                          │   │
│  │                                                              │   │
│  │  Event Handlers:                                            │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  joinRoom   │  │ chatMessage  │  │  addReaction    │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │ disconnect  │  │deleteMessage │  │  (more events)  │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────▼───────────────────────────────┐    │
│  │                    Business Logic Layer                     │    │
│  │  ┌───────────┐  ┌────────────┐  ┌──────────────────┐     │    │
│  │  │  users.js │  │messages.js │  │  Superuser       │     │    │
│  │  │ (In-Mem)  │  │ (Format)   │  │  Authorization   │     │    │
│  │  └───────────┘  └────────────┘  └──────────────────┘     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  DATABASE LAYER     │
                    │                     │
                    │  ┌──────────────┐  │
                    │  │ PostgreSQL   │  │
                    │  │ (Render DB)  │  │
                    │  │              │  │
                    │  │ Tables:      │  │
                    │  │ - messages   │  │
                    │  └──────────────┘  │
                    │                     │
                    │  In-Memory:         │
                    │  - Active Users     │
                    │  - Reactions Map    │
                    │  - Message IDs      │
                    └─────────────────────┘
```

---

## 🔄 Data Flow Workflows

### 1️⃣ User Authentication & Login Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Opens index.html
     ▼
┌─────────────────┐
│  index.html     │
│  - Loading      │
│    animation    │
│  - Auth check   │
└────┬────────────┘
     │
     │ 2. Fetch /api/user
     ▼
┌─────────────────┐
│  Server         │
│  Auth0          │
│  Middleware     │
└────┬────────────┘
     │
     ├─── Authenticated? ───┐
     │                      │
     ▼ YES                  ▼ NO
┌─────────────┐      ┌─────────────┐
│Show Profile │      │Show Login   │
│& Logout     │      │Button       │
└─────┬───────┘      └─────┬───────┘
     │                     │
     │ 3. Enter username   │
     ├─────────────────────┘
     │
     │ 4. Submit form
     ▼
┌─────────────────┐
│  rooms.html     │
│  ?username=X    │
└────┬────────────┘
     │
     │ 5. Select room
     ▼
┌─────────────────┐
│  chat.html      │
│  ?username=X    │
│  &room=Y        │
└─────────────────┘
```

---

### 2️⃣ Joining a Chat Room Flow

```
┌──────────────┐
│  chat.html   │
│  Loads       │
└──────┬───────┘
       │
       │ 1. Extract username & room from URL params
       ▼
┌──────────────────────┐
│  main.js             │
│  const {username,    │
│         room} =      │
│  Qs.parse()          │
└──────┬───────────────┘
       │
       │ 2. Emit 'joinRoom' event
       │    { username, room }
       ▼
┌──────────────────────────────────────┐
│  Server: socket.on('joinRoom')       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 1. userJoin(socket.id,         │ │
│  │    username, room)             │ │
│  │    → Add to in-memory users[]  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 2. socket.join(room)           │ │
│  │    → Join Socket.IO room       │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 3. Check if superuser          │ │
│  │    SUPERUSERS.includes(user)   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 4. Load message history        │ │
│  │    getRoomMessages(room, 100)  │ │
│  │    → Query PostgreSQL          │ │
│  └────────────────────────────────┘ │
└──────┬───────────────────────────────┘
       │
       │ 3. Emit events back to client
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────────┐              ┌──────────────────┐
│ socket.emit      │              │ socket.broadcast │
│ 'superuserStatus'│              │ 'message'        │
│ 'messageHistory' │              │ (join message)   │
│ 'message'        │              └──────────────────┘
│ (welcome msg)    │
└──────┬───────────┘
       │
       │ 4. Update UI
       ▼
┌─────────────────────────┐
│  Client: main.js        │
│                         │
│  - Display history      │
│  - Show welcome msg     │
│  - Update user list     │
│  - Set superuser flag   │
└─────────────────────────┘
```

---

### 3️⃣ Sending a Message Flow

```
┌─────────────┐
│  User types │
│  message    │
└──────┬──────┘
       │
       │ 1. Types in #msg input
       │ 2. Presses Enter or clicks Send
       ▼
┌────────────────────────────┐
│  chat-form submit event    │
│  e.preventDefault()        │
└──────┬─────────────────────┘
       │
       │ 3. Emit 'chatMessage' event
       │    socket.emit('chatMessage', msg)
       ▼
┌───────────────────────────────────────────────┐
│  Server: socket.on('chatMessage')             │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 1. Get user info                        │ │
│  │    getCurrentUser(socket.id)            │ │
│  │    → { id, username, room }             │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 2. Generate message ID                  │ │
│  │    messageId = `${room}-${Date.now()}-  │ │
│  │                ${random()}`             │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 3. Format message                       │ │
│  │    formatMessage(username, text)        │ │
│  │    → Add timestamp, id, isSuperuser     │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 4. Store in tracking maps               │ │
│  │    messageIds.set(id, metadata)         │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 5. Broadcast to room                    │ │
│  │    io.to(room).emit('message', msg)     │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 6. Save to database                     │ │
│  │    saveMessage(room, username, text,    │ │
│  │                messageId, 'text', time) │ │
│  │    → INSERT INTO messages               │ │
│  └─────────────────────────────────────────┘ │
└───────┬───────────────────────────────────────┘
        │
        │ 7. Emit 'message' event to all clients in room
        ▼
┌───────────────────────────────────┐
│  All Clients: socket.on('message')│
│                                   │
│  outputMessage(message)           │
│  ┌─────────────────────────────┐ │
│  │ 1. Create DOM elements      │ │
│  │ 2. Add username + badge     │ │
│  │ 3. Add timestamp (right)    │ │
│  │ 4. Add message text         │ │
│  │ 5. Add action buttons       │ │
│  │ 6. Add reactions container  │ │
│  │ 7. Append to chat-messages  │ │
│  │ 8. Scroll to bottom         │ │
│  └─────────────────────────────┘ │
└───────────────────────────────────┘
```

---

### 4️⃣ Emoji Reaction Flow

```
┌─────────────────┐
│  User hovers    │
│  over message   │
└────────┬────────┘
         │
         │ 1. CSS :hover shows .message-actions
         ▼
┌─────────────────────────┐
│  Message Actions        │
│  [😊] [🗑️]             │
└────────┬────────────────┘
         │
         │ 2. Click emoji button
         ▼
┌─────────────────────────┐
│  toggleEmojiPicker()    │
│  - Show emoji grid      │
│  - 12 emoji options     │
└────────┬────────────────┘
         │
         │ 3. Click emoji (e.g., ❤️)
         ▼
┌─────────────────────────────┐
│  addReaction()              │
│  socket.emit('addReaction', │
│    { messageId, emoji,      │
│      username })            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Server: socket.on('addReaction')       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 1. Get message metadata           │ │
│  │    messageIds.get(messageId)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 2. Get/create reactions map       │ │
│  │    messageReactions.get(messageId)│ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 3. Toggle user in emoji array     │ │
│  │    if (user in array)             │ │
│  │      → remove (un-react)          │ │
│  │    else                           │ │
│  │      → add (react)                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 4. Broadcast to room              │ │
│  │    io.to(room)                    │ │
│  │      .emit('emojiReaction', {...})│ │
│  └───────────────────────────────────┘ │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  All Clients: socket.on('emojiReaction')│
│                                         │
│  updateReaction(messageId, emoji, user) │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 1. Find message element           │ │
│  │    querySelector([data-message-id])│ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 2. Find or create reaction bubble │ │
│  │    with emoji                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 3. Update count                   │ │
│  │    count.innerText = users.length │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 4. Highlight if user reacted      │ │
│  │    .add('user-reacted')           │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 5️⃣ Message Deletion Flow (Superuser/Owner)

```
┌──────────────────┐
│  User hovers     │
│  over message    │
└────────┬─────────┘
         │
         │ CSS shows delete button if:
         │ - User is message owner OR
         │ - User is superuser
         ▼
┌─────────────────────┐
│  [🗑️] Delete btn   │
└────────┬────────────┘
         │
         │ Click delete button
         ▼
┌─────────────────────────┐
│  deleteMessage()        │
│  - Show confirmation    │
│  - "Are you sure?"      │
└────────┬────────────────┘
         │
         │ Confirm ✓
         ▼
┌──────────────────────────────┐
│  socket.emit('deleteMessage',│
│    { messageId })            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Server: socket.on('deleteMessage')      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 1. Get current user                │ │
│  │    getCurrentUser(socket.id)       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 2. Get message metadata            │ │
│  │    messageIds.get(messageId)       │ │
│  │    → { room, username, text }      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 3. Authorization check             │ │
│  │    if (SUPERUSERS.includes(user)   │ │
│  │        OR username === owner)      │ │
│  │      → ALLOW                       │ │
│  │    else                            │ │
│  │      → DENY (return)               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 4. Remove from tracking            │ │
│  │    messageIds.delete(messageId)    │ │
│  │    messageReactions.delete(id)     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 5. Broadcast deletion              │ │
│  │    io.to(room)                     │ │
│  │      .emit('messageDeleted', {id}) │ │
│  └────────────────────────────────────┘ │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  All Clients: socket.on('messageDeleted')│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 1. Find message element            │ │
│  │    querySelector([data-message-id])│ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 2. Remove from DOM                 │ │
│  │    messageEl.remove()              │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

### 6️⃣ User Disconnect Flow

```
┌─────────────────┐
│  User closes    │
│  browser tab    │
│  or navigates   │
│  away           │
└────────┬────────┘
         │
         │ Browser closes WebSocket
         ▼
┌────────────────────────────┐
│  Server: socket.disconnect │
│  event triggered           │
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐ │
│  │ 1. userLeave(socket.id)        │ │
│  │    → Remove from users[]       │ │
│  │    → Return user info          │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 2. Create leave message        │ │
│  │    formatMessage(botName,      │ │
│  │      "X has left")             │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 3. Broadcast to room           │ │
│  │    io.to(room)                 │ │
│  │      .emit('message', leaveMsg)│ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 4. Save to database            │ │
│  │    saveMessage(..., 'system')  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 5. Update user list            │ │
│  │    io.to(room)                 │ │
│  │      .emit('roomUsers', {...}) │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 🗄️ Data Storage Architecture

### In-Memory Storage (Server Runtime)
```javascript
// Active Users (session-based)
users = [
  { id: 'socket-id-1', username: 'john', room: 'JavaScript' },
  { id: 'socket-id-2', username: 'admin', room: 'JavaScript' },
  // ... more users
]

// Message Reactions (volatile)
messageReactions = Map {
  'JS-1730000000-abc123' => {
    '❤️': ['john', 'jane', 'admin'],
    '👍': ['bob'],
  },
  // ... more messages
}

// Message Metadata (volatile)
messageIds = Map {
  'JS-1730000000-abc123' => {
    room: 'JavaScript',
    username: 'john',
    text: 'Hello world',
    time: '12:30 PM'
  },
  // ... more messages
}
```

### Persistent Storage (PostgreSQL)
```sql
-- messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  message_id VARCHAR(255),
  message_type VARCHAR(50) DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_room ON messages(room);
CREATE INDEX idx_timestamp ON messages(timestamp DESC);
```

---

## 🔐 Security & Authorization

### Superuser System
```
┌─────────────────────────────────────┐
│  .env Configuration                 │
│  SUPERUSERS=admin,superuser         │
└────────┬────────────────────────────┘
         │
         │ Server loads on startup
         ▼
┌─────────────────────────────────────┐
│  const SUPERUSERS =                 │
│    process.env.SUPERUSERS.split(',')│
└────────┬────────────────────────────┘
         │
         │ On user join
         ▼
┌─────────────────────────────────────┐
│  Check if username in SUPERUSERS    │
│  ↓                                  │
│  Set isSuperuser flag in message    │
│  ↓                                  │
│  Send to client                     │
│  ↓                                  │
│  Client stores in localStorage      │
└─────────────────────────────────────┘
```

### Auth0 Integration (Optional)
```
┌─────────────┐
│ Auth0 Flow  │
└─────┬───────┘
      │
      │ 1. /login → Redirect to Auth0
      ▼
┌─────────────────────┐
│  Auth0 Login Page   │
│  (External)         │
└─────┬───────────────┘
      │
      │ 2. User authenticates
      ▼
┌─────────────────────┐
│  /callback          │
│  Auth0 returns      │
│  user info + token  │
└─────┬───────────────┘
      │
      │ 3. Session created
      ▼
┌─────────────────────┐
│  index.html         │
│  Shows user profile │
│  Pre-fills username │
└─────────────────────┘
```

---

## 🎨 UI State Management

### Loading Screen States
```
Page Load → Loading Animation (1.5s) → Hide → Show Content

Transitions:
  index.html    → "Welcome to ChatCord..."
  rooms.html    → "Loading Rooms..."
  room click    → "Joining {RoomName}..."
  chat.html     → "Connecting to chat..."
```

### Theme Management
```
localStorage.getItem('chatcordTheme')
  ↓
  If 'dark' → body.classList.add('dark')
  If 'light' → body.classList.remove('dark')
  ↓
CSS variables switch:
  --glass-bg, --text-primary, --glass-border
```

---

## ⚡ Real-time Event System

### Socket.IO Events Reference

**Client → Server:**
```javascript
socket.emit('joinRoom', { username, room })
socket.emit('chatMessage', text)
socket.emit('addReaction', { messageId, emoji, username })
socket.emit('deleteMessage', { messageId })
```

**Server → Client:**
```javascript
socket.emit('superuserStatus', { isSuperuser })
socket.emit('message', messageObject)
socket.emit('messageHistory', messagesArray)
io.to(room).emit('message', messageObject)
io.to(room).emit('roomUsers', { room, users })
io.to(room).emit('emojiReaction', { messageId, emoji, username })
io.to(room).emit('messageDeleted', { messageId })
```

---

## 📦 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           RENDER PLATFORM                    │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Web Service (Node.js)                 │ │
│  │  - Auto-deploy from GitHub             │ │
│  │  - Environment variables from .env     │ │
│  │  - Port: 10000 (or dynamic)            │ │
│  └────────┬───────────────────────────────┘ │
│           │                                  │
│  ┌────────▼───────────────────────────────┐ │
│  │  PostgreSQL Database                   │ │
│  │  - Managed by Render                   │ │
│  │  - Automatic backups                   │ │
│  │  - DATABASE_URL env variable           │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Custom Domain  │
│  (Optional)     │
└─────────────────┘
```

---

## 🔄 Error Handling & Resilience

### Database Connection Failure
```
initDatabase() fails
  ↓
Catch error, log warning
  ↓
Continue running WITHOUT persistence
  ↓
Messages still work (in-memory only)
  ↓
"Graceful degradation" - core features still work
```

### Socket Reconnection
```
Client loses connection
  ↓
Socket.IO auto-reconnects
  ↓
Client re-emits joinRoom
  ↓
Server loads message history
  ↓
User rejoins seamlessly
```

---

## 📊 Performance Optimizations

1. **Message History Limiting**: Only load last 100 messages per room
2. **In-Memory Caching**: Active users and reactions stored in memory
3. **Indexed Database**: PostgreSQL indexes on room and timestamp
4. **CSS Animations**: Hardware-accelerated transforms and opacity
5. **Lazy Loading**: Emoji picker only rendered when clicked
6. **Event Debouncing**: Prevent spam reactions/deletions

---

## 🔧 Configuration Files

```
.env
├── PORT                    # Server port
├── DATABASE_URL            # PostgreSQL connection
├── SUPERUSERS              # Comma-separated admin usernames
├── AUTH0_SECRET            # Auth0 configuration
├── AUTH0_BASE_URL          # 
├── AUTH0_CLIENT_ID         # 
└── AUTH0_ISSUER_BASE_URL   # 

package.json
├── dependencies            # Express, Socket.IO, etc.
├── scripts
│   ├── dev                 # nodemon server.js
│   └── start               # node server.js

server.js
├── Express setup
├── Socket.IO configuration
├── Route definitions
└── Event handlers
```

---

## 🎯 Key Design Decisions

1. **Hybrid Storage**: In-memory for real-time features, PostgreSQL for persistence
2. **Superuser via .env**: Simple configuration, no database user management
3. **Volatile Reactions**: Trade persistence for speed (reactions don't survive server restart)
4. **Message IDs**: UUID-like strings for tracking without database lookups
5. **Auth0 Optional**: App works with or without authentication
6. **CSS-first Animations**: No JS animation libraries, pure CSS for performance
7. **Socket.IO Rooms**: Built-in room support, no external pub/sub needed

---

This architecture provides a scalable, maintainable foundation for real-time chat with room-based messaging, reactions, and admin controls.
