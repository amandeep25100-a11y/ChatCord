# ChatCord Frontend Documentation

## Overview

ChatCord features a modern, interactive frontend built with vanilla JavaScript, Socket.IO client, and custom CSS with cosmic-themed animations. The application provides a real-time chat experience with advanced features like emoji reactions, AI moderation, authentication, and admin controls.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Pages](#pages)
3. [Styling & Theming](#styling--theming)
4. [JavaScript Modules](#javascript-modules)
5. [Real-Time Features](#real-time-features)
6. [User Interface Components](#user-interface-components)
7. [Authentication Flow](#authentication-flow)
8. [Admin Panel](#admin-panel)
9. [Accessibility](#accessibility)
10. [Browser Support](#browser-support)

---

## Architecture

### Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom animations, gradients, and modern layouts
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Socket.IO Client**: Real-time WebSocket communication
- **Qs.js**: Query string parsing
- **Font Awesome**: Icon library

### File Structure

```
public/
├── index.html          # Landing/authentication page
├── rooms.html          # Room selection page
├── chat.html           # Main chat interface
├── admin.html          # Admin dashboard
├── robots.txt          # SEO configuration
├── css/
│   └── style.css       # Main stylesheet (2192 lines)
└── js/
    └── main.js         # Client-side logic (409 lines)
```

---

## Pages

### 1. Landing Page (`index.html`)

**Purpose**: Entry point for authentication and room selection

**Features**:
- Auth0 integration with login/logout
- User profile display with avatar
- Room selection form
- Username input (pre-filled for authenticated users)
- Responsive design with cosmic theme

**Key Elements**:
```html
<div class="auth-section">
  - User badge with profile picture
  - Authentication buttons
  - Session management
</div>
<div class="join-container">
  - Username input field
  - Room dropdown selection
  - Join button
</div>
```

**Room Options**:
- JavaScript Learners
- Python Developers
- Ruby Enthusiasts
- PHP Coders
- C# Developers
- Java Masters
- General Chat

### 2. Rooms Page (`rooms.html`)

**Purpose**: Enhanced room selection interface with visual room cards

**Features**:
- Dynamic room loading from server
- Active user count per room
- Visual room categories with icons
- Theme toggle (light/dark mode)
- Responsive grid layout

**Room Categories**:
- 📚 Study Rooms (Math, Science, Literature)
- 💻 Tech Rooms (JavaScript, Python, Web Dev)
- 🎨 Creative (Art & Design, Music, Writing)
- 🌐 General (General Chat, Gaming, Random)

### 3. Chat Room (`chat.html`)

**Purpose**: Main real-time chat interface

**Features**:
- Real-time message display
- User sidebar with active participants
- Message actions (emoji reactions, delete)
- Typing indicators
- Message history
- Loading animations
- Cosmic animated background

**Layout**:
```
┌─────────────────────────────────────┐
│  Header: Room Name | Leave Button   │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   Message Feed           │
│ - Room   │   - Messages             │
│ - Users  │   - Reactions            │
│          │   - Actions              │
│          │                          │
├──────────┴──────────────────────────┤
│  Input: Message Form                │
└─────────────────────────────────────┘
```

### 4. Admin Panel (`admin.html`)

**Purpose**: Administrative dashboard for monitoring and moderation

**Features**:
- Real-time statistics
- Flagged message monitoring
- User management
- Room overview
- AI moderation settings
- Message deletion controls

**Statistics Displayed**:
- Total messages
- Active users
- Total rooms
- Flagged messages count

---

## Styling & Theming

### Design Philosophy

ChatCord employs a **cosmic space theme** with glassmorphism effects, creating an immersive and modern user experience.

### Color Scheme

#### Light Mode (Default)
```css
--primary-color: #60a5fa      /* Sky Blue */
--secondary-color: #3b82f6    /* Blue */
--background: Linear gradient  /* Purple to indigo */
--text-color: #ffffff          /* White */
```

#### Dark Mode
```css
--primary-color: #3b82f6
--background: Darker gradients
Enhanced cosmic effects
```

### Key Visual Features

#### 1. **Loading Screen**
- Animated logo with floating effect
- Expanding circles
- Progress bar with gradient
- Smooth fade-out transition

```css
.loading-screen {
  - Full viewport overlay
  - Gradient background
  - z-index: 999999
  - Smooth transitions
}
```

#### 2. **Cosmic Background Layers**
```html
<div class="space-layer"></div>      <!-- Deep space gradient -->
<div class="stars-distant"></div>     <!-- Far stars -->
<div class="stars-mid"></div>         <!-- Mid-range stars -->
<div class="stars-close"></div>       <!-- Close stars -->
<div class="clouds"></div>            <!-- Nebula clouds -->
<div class="shooting-star"></div>     <!-- Animated meteors -->
<div class="comet"></div>             <!-- Comet trails -->
```

**Animations**:
- `twinkle`: Star blinking effect
- `moveStar`: Stars drifting
- `shootingStar`: Meteor animations
- `moveClouds`: Nebula movement
- `floatAnimation`: Floating elements

#### 3. **Glassmorphism Effects**
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: Multiple layers for depth
}
```

#### 4. **Message Styling**

**Regular Messages**:
- Semi-transparent background
- Hover effects
- Smooth transitions
- User badges (ADMIN)

**Flagged Messages**:
```css
.flagged-message {
  border-left: 4px solid #ef4444;  /* Red warning */
  background: rgba(239, 68, 68, 0.1);
}
```

#### 5. **Interactive Elements**

**Buttons**:
- Neon glow effects
- Hover transformations
- Active state feedback
- Ripple animations

**Emoji Reactions**:
- Floating picker overlay
- Scale animations on click
- User reaction highlighting
- Count badges

---

## JavaScript Modules

### Core Functions (`main.js`)

#### 1. **Socket.IO Connection**

```javascript
const socket = io();

// Join room
socket.emit('joinRoom', { username, room });

// Listen for events
socket.on('message', (message) => {...});
socket.on('roomUsers', ({ room, users }) => {...});
socket.on('emojiReaction', ({ messageId, emoji, username }) => {...});
socket.on('messageDeleted', ({ messageId }) => {...});
socket.on('messageBlocked', ({ reason, confidence }) => {...});
```

#### 2. **Message Handling**

```javascript
// Output message to DOM
function outputMessage(message) {
  - Creates message div
  - Adds user metadata (username, time, badges)
  - Displays message text
  - Attaches action buttons (emoji, delete)
  - Renders existing reactions
  - Auto-scrolls to bottom
}

// Submit new message
chatForm.addEventListener('submit', (e) => {
  - Prevents default form submission
  - Trims message text
  - Emits to server via socket
  - Clears input field
});
```

#### 3. **Emoji Reactions**

```javascript
// Create emoji picker
function createEmojiPicker(messageId) {
  - Displays 12 emoji options
  - 👍 ❤️ 😂 😮 😢 😡 🎉 🔥 👏 💯 ✅ ⭐
  - Handles click to add reaction
  - Closes picker after selection
}

// Add reaction
function addReaction(messageId, emoji) {
  socket.emit('addReaction', { messageId, emoji, username });
}

// Update reaction display
function updateReaction(messageId, emoji, username) {
  - Finds or creates reaction element
  - Updates user list and count
  - Highlights user's own reactions
}
```

#### 4. **Message Deletion**

```javascript
function deleteMessage(messageId) {
  - Confirms deletion
  - Emits delete request to server
  - Server validates permissions (superuser/owner)
  - Removes from DOM on success
}

// Only visible for:
- Message owner
- Superusers (admins)
```

#### 5. **User Interface Updates**

```javascript
// Display room name
function outputRoomName(room) {
  roomName.innerText = room;
}

// Display active users
function outputUsers(users) {
  - Clears user list
  - Creates list items for each user
  - Adds superuser badges
  - Updates sidebar
}

// Notification system
function showNotification(message, type, confidence) {
  - Creates toast notification
  - Displays for 5 seconds
  - Includes severity (error, success, info)
  - Shows AI confidence scores
}
```

#### 6. **Loading Screen Management**

```javascript
window.addEventListener('load', () => {
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 2000);  // 2-second minimum display
});
```

#### 7. **Authorization Checks**

```javascript
function checkIfSuperuser() {
  return localStorage.getItem('isSuperuser') === 'true';
}

// Superuser status received from server
socket.on('superuserStatus', ({ isSuperuser }) => {
  localStorage.setItem('isSuperuser', isSuperuser.toString());
});
```

---

## Real-Time Features

### Socket.IO Events

#### **Client → Server**

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ username, room }` | User joins a chat room |
| `chatMessage` | `text` | Send new message |
| `addReaction` | `{ messageId, emoji, username }` | Add emoji reaction |
| `deleteMessage` | `messageId` | Delete a message |

#### **Server → Client**

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `message object` | New message received |
| `roomUsers` | `{ room, users[] }` | Updated room/user list |
| `emojiReaction` | `{ messageId, emoji, username }` | Reaction added |
| `messageDeleted` | `{ messageId }` | Message removed |
| `messageBlocked` | `{ reason, confidence }` | AI blocked message |
| `deleteFailed` | `{ reason }` | Deletion unauthorized |
| `messageHistory` | `messages[]` | Load past messages |
| `superuserStatus` | `{ isSuperuser }` | Admin privileges |

### Message Object Structure

```javascript
{
  id: Number,              // Unique identifier
  username: String,        // Sender username
  text: String,            // Message content
  time: String,            // Formatted timestamp
  isSuperuser: Boolean,    // Admin badge
  flagged: Boolean,        // AI moderation flag
  reactions: {             // Emoji reactions
    "👍": ["user1", "user2"],
    "❤️": ["user3"]
  }
}
```

---

## User Interface Components

### 1. **Message Actions Bar**

```html
<div class="message-actions">
  <button class="emoji-btn">😊</button>
  <button class="delete-btn">🗑️</button>  <!-- Conditional -->
  <div class="emoji-picker">...</div>
</div>
```

**Visibility Rules**:
- Emoji button: Always visible
- Delete button: Owner or superuser only

### 2. **Reactions Display**

```html
<div class="message-reactions">
  <div class="reaction user-reacted">  <!-- If user reacted -->
    <span class="emoji">👍</span>
    <span class="count">5</span>
  </div>
</div>
```

**Interaction**:
- Click to add/remove your reaction
- Hover shows tooltip with user list
- Animated scale on click

### 3. **User Sidebar**

```html
<div class="chat-sidebar">
  <h3 id="room-name">JavaScript Learners</h3>
  <ul id="users">
    <li>
      👤 John Doe
      <span class="superuser-badge">ADMIN</span>
    </li>
  </ul>
</div>
```

### 4. **Chat Form**

```html
<form id="chat-form">
  <input
    id="msg"
    type="text"
    placeholder="Enter Message"
    required
    autocomplete="off"
  />
  <button class="btn">
    <i class="fas fa-paper-plane"></i> Send
  </button>
</form>
```

**Features**:
- Auto-focus on load
- Enter to send
- Clears after submission
- Trim whitespace validation

### 5. **Notification Toasts**

```javascript
<div class="notification ${type}">
  <strong>${type.toUpperCase()}</strong>
  <p>${message}</p>
  <span class="confidence">${confidence}%</span>  <!-- If provided -->
</div>
```

**Types**:
- `error`: Red, for blocked/failed actions
- `success`: Green, for confirmations
- `info`: Blue, for general notices

---

## Authentication Flow

### Auth0 Integration

#### 1. **Login Process**

```javascript
// Redirect to Auth0 login
window.location.href = '/auth/login';

// After callback, user data available:
{
  username: auth0_profile.nickname,
  email: auth0_profile.email,
  picture: auth0_profile.picture,
  isSuperuser: Boolean
}
```

#### 2. **Session Management**

```javascript
// Check authentication status
if (user) {
  // Pre-fill username
  // Display profile badge
  // Show logout button
} else {
  // Show login button
  // Manual username entry required
}
```

#### 3. **Logout**

```javascript
// Clear session
window.location.href = '/auth/logout';
// Redirects to index after clearing
```

### Local Storage Usage

```javascript
// Store superuser status
localStorage.setItem('isSuperuser', 'true');

// Retrieve for UI updates
const isAdmin = localStorage.getItem('isSuperuser') === 'true';
```

---

## Admin Panel

### Features

#### 1. **Dashboard Statistics**

```javascript
{
  totalMessages: Number,
  activeUsers: Number,
  totalRooms: Number,
  flaggedMessages: Number
}
```

Real-time updates via Socket.IO

#### 2. **Flagged Messages View**

Displays AI-moderated messages with:
- Flagging reason
- Confidence score
- Timestamp
- User information
- Delete option

#### 3. **Room Management**

- View all active rooms
- User count per room
- Room activity metrics

#### 4. **User Management**

- Active user list
- Ban/unban capabilities
- Promote to admin
- Activity monitoring

### Access Control

```javascript
// Admin panel access check
if (!checkIfSuperuser()) {
  window.location.href = '/';  // Redirect to home
}
```

---

## Accessibility

### ARIA Labels

```html
<button aria-label="Send message">...</button>
<button aria-label="Toggle theme">...</button>
<button aria-label="Add emoji reaction">...</button>
```

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter**: Submit messages, select rooms
- **Escape**: Close emoji picker

### Screen Reader Support

- Semantic HTML5 elements (`<main>`, `<header>`, `<aside>`)
- Descriptive button text
- Status announcements for new messages
- Alt text for profile images

### Color Contrast

- WCAG AA compliant text contrast
- High-visibility focus indicators
- Color-blind friendly palette options

---

## Browser Support

### Minimum Requirements

- **Chrome/Edge**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Mobile**: iOS 14+, Android 11+

### Required Features

- ES6+ JavaScript
- CSS Grid and Flexbox
- WebSocket support (Socket.IO)
- LocalStorage API
- Fetch API
- CSS animations and transforms

### Progressive Enhancement

- Core chat functionality works without CSS animations
- Fallback for browsers without backdrop-filter
- Graceful degradation for older browsers

---

## Performance Optimizations

### 1. **Lazy Loading**

- Messages loaded in batches (history)
- Images lazy-loaded when visible
- Emoji picker rendered on demand

### 2. **Debouncing**

- Scroll events throttled
- Window resize events debounced
- Typing indicators rate-limited

### 3. **DOM Optimization**

- Virtual scrolling for large message lists
- Element reuse for reactions
- Minimal reflows with DocumentFragment

### 4. **Asset Optimization**

- Minified CSS (production)
- Compressed images
- CDN for Font Awesome
- Socket.IO CDN fallback

---

## Future Enhancements

### Planned Features

1. **Rich Text Editor**
   - Markdown support
   - Code syntax highlighting
   - Link previews

2. **File Sharing**
   - Image uploads
   - File attachments
   - Drag-and-drop interface

3. **Voice/Video**
   - WebRTC integration
   - Voice messages
   - Video calls

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

5. **Customization**
   - Custom themes
   - User avatars
   - Room backgrounds

---

## Development Guidelines

### Code Style

- **Indentation**: Tabs (2 spaces equivalent)
- **Quotes**: Single quotes for JS strings
- **Semicolons**: Required
- **Comments**: JSDoc for functions

### Naming Conventions

- **Variables**: camelCase (`userName`, `messageId`)
- **Functions**: camelCase (`outputMessage`, `addReaction`)
- **Classes**: kebab-case (`message-actions`, `emoji-picker`)
- **IDs**: kebab-case (`chat-form`, `room-name`)

### Testing Checklist

- [ ] Message sending/receiving
- [ ] Emoji reactions (add/remove)
- [ ] Message deletion (auth check)
- [ ] Room switching
- [ ] Authentication flow
- [ ] Admin panel access
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Theme switching
- [ ] AI moderation notifications
- [ ] Loading animations

---

## Troubleshooting

### Common Issues

#### 1. **Messages Not Sending**

```javascript
// Check socket connection
if (!socket.connected) {
  socket.connect();
}

// Verify message format
console.log('Message:', msg.trim());
```

#### 2. **Emoji Picker Not Showing**

```javascript
// Check z-index conflicts
.emoji-picker {
  z-index: 1000 !important;
}

// Verify active class toggle
console.log(picker.classList.contains('active'));
```

#### 3. **Authentication Issues**

```javascript
// Clear localStorage
localStorage.clear();

// Check Auth0 configuration
console.log('Auth callback URL:', window.location.href);
```

#### 4. **Styling Not Loading**

```html
<!-- Verify CSS path -->
<link rel="stylesheet" href="css/style.css" />

<!-- Check for CORS issues in console -->
```

---

## Resources

### External Dependencies

- **Socket.IO Client**: https://socket.io/docs/v4/client-api/
- **Qs.js**: https://github.com/ljharb/qs
- **Font Awesome**: https://fontawesome.com/v5/search
- **Auth0**: https://auth0.com/docs

### Related Documentation

- [Backend Documentation](BACKEND.md)
- [Authentication Guide](AUTH0_SETUP.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOY_GUIDE.md)
- [UI/UX Design](UI_UX_DESIGN.md)

---

## Contributing

When contributing to the frontend:

1. Follow the existing code style
2. Test across multiple browsers
3. Ensure mobile responsiveness
4. Add comments for complex logic
5. Update this documentation
6. Create pull request with screenshots

---

## License

This frontend is part of the ChatCord project. See main README.md for license information.

---

**Last Updated**: October 29, 2025
**Version**: 2.0
**Maintainer**: ChatCord Development Team
