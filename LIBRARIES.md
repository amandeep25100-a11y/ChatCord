# ChatCord - Libraries & Dependencies

## Overview

This document provides a comprehensive list of all libraries, frameworks, and dependencies used in the ChatCord project, including both backend (Node.js) and frontend (client-side) technologies.

---

## Table of Contents

1. [Backend Dependencies](#backend-dependencies)
2. [Frontend Dependencies](#frontend-dependencies)
3. [Development Dependencies](#development-dependencies)
4. [Node.js Built-in Modules](#nodejs-built-in-modules)
5. [External CDN Resources](#external-cdn-resources)
6. [Version Information](#version-information)

---

## Backend Dependencies

### Production Dependencies (package.json)

#### 1. **Express.js**
- **Version**: ^4.17.1
- **Purpose**: Web application framework for Node.js
- **Usage**: Main server framework, routing, middleware
- **Documentation**: https://expressjs.com/
- **License**: MIT
```javascript
const express = require("express");
const app = express();
```

#### 2. **Socket.IO**
- **Version**: ^4.4.1
- **Purpose**: Real-time bidirectional event-based communication
- **Usage**: WebSocket connections, real-time chat functionality
- **Documentation**: https://socket.io/
- **License**: MIT
```javascript
const socketio = require("socket.io");
const io = socketio(server);
```

#### 3. **PostgreSQL (pg)**
- **Version**: ^8.11.3
- **Purpose**: PostgreSQL database client for Node.js
- **Usage**: Database connection, message persistence, user data storage
- **Documentation**: https://node-postgres.com/
- **License**: MIT
```javascript
const { Pool } = require('pg');
```

#### 4. **Redis**
- **Version**: ^4.0.2
- **Purpose**: In-memory data structure store
- **Usage**: Caching, session storage, real-time data
- **Documentation**: https://redis.io/
- **License**: MIT
```javascript
const redis = require('redis');
```

#### 5. **@socket.io/redis-adapter**
- **Version**: ^7.1.0
- **Purpose**: Redis adapter for Socket.IO
- **Usage**: Scale Socket.IO to multiple servers/processes
- **Documentation**: https://socket.io/docs/v4/redis-adapter/
- **License**: MIT
```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
```

#### 6. **Moment.js**
- **Version**: ^2.24.0
- **Purpose**: Parse, validate, manipulate, and display dates/times
- **Usage**: Message timestamp formatting
- **Documentation**: https://momentjs.com/
- **License**: MIT
```javascript
const moment = require('moment');
```

#### 7. **dotenv**
- **Version**: ^14.3.2
- **Purpose**: Load environment variables from .env file
- **Usage**: Configuration management, sensitive data storage
- **Documentation**: https://github.com/motdotla/dotenv
- **License**: BSD-2-Clause
```javascript
require("dotenv").config();
```

#### 8. **express-openid-connect**
- **Version**: ^2.17.1
- **Purpose**: Auth0 authentication middleware for Express
- **Usage**: OAuth 2.0/OpenID Connect authentication, user login/logout
- **Documentation**: https://github.com/auth0/express-openid-connect
- **License**: MIT
```javascript
const { auth, requiresAuth } = require('express-openid-connect');
```

#### 9. **express-session**
- **Version**: ^1.18.0
- **Purpose**: Session middleware for Express
- **Usage**: User session management, state persistence
- **Documentation**: https://github.com/expressjs/session
- **License**: MIT
```javascript
const session = require("express-session");
```

#### 10. **cookie-parser**
- **Version**: ^1.4.6
- **Purpose**: Parse Cookie header and populate req.cookies
- **Usage**: Cookie handling for authentication
- **Documentation**: https://github.com/expressjs/cookie-parser
- **License**: MIT
```javascript
const cookieParser = require("cookie-parser");
```

#### 11. **Multer**
- **Version**: ^1.4.5-lts.1
- **Purpose**: Middleware for handling multipart/form-data
- **Usage**: File uploads (images, attachments)
- **Documentation**: https://github.com/expressjs/multer
- **License**: MIT
```javascript
const multer = require('multer');
```

---

## Frontend Dependencies

### Client-Side Libraries (Loaded via CDN)

#### 1. **Socket.IO Client**
- **Version**: 4.4.1 (matches server version)
- **Purpose**: Client-side Socket.IO library
- **Usage**: Real-time communication with server
- **Source**: `/socket.io/socket.io.js` (served by Socket.IO server)
- **Documentation**: https://socket.io/docs/v4/client-api/
```html
<script src="/socket.io/socket.io.js"></script>
```
```javascript
const socket = io();
```

#### 2. **Qs.js (Query String Parser)**
- **Version**: 6.9.2
- **CDN**: Cloudflare CDN
- **Purpose**: Query string parsing and stringifying
- **Usage**: Parse URL parameters for username and room
- **Documentation**: https://github.com/ljharb/qs
- **License**: BSD-3-Clause
```html
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.9.2/qs.min.js"
  integrity="sha256-TDxXjkAUay70ae/QJBEpGKkpVslXaHHayklIVglFRT4="
  crossorigin="anonymous"
></script>
```
```javascript
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
```

#### 3. **Font Awesome**
- **Version**: 5.12.1
- **CDN**: Cloudflare CDN
- **Purpose**: Icon library
- **Usage**: UI icons throughout the application
- **Documentation**: https://fontawesome.com/
- **License**: Font Awesome Free License
```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css"
  integrity="sha256-mmgLkCYLUQbXn0B1SRqzHar6dCnv9oZFPEC1g1cwlkk="
  crossorigin="anonymous"
/>
```

**Icons Used**:
- `fas fa-comments` - Chat/messaging
- `fas fa-smile` - Chat header
- `fas fa-users` - User list
- `fas fa-paper-plane` - Send button
- `fas fa-door-open` - Rooms
- `fas fa-sign-in-alt` - Login
- `fas fa-sign-out-alt` - Logout
- And many more...

#### 4. **Vanilla JavaScript (ES6+)**
- **Version**: ES2015+
- **Purpose**: Core client-side functionality
- **Usage**: DOM manipulation, event handling, Socket.IO integration
- **File**: `/public/js/main.js` (409 lines)
- **Features Used**:
  - Arrow functions
  - Template literals
  - Destructuring
  - Const/Let
  - Modules (via script tags)
  - Async/Await (if needed)

---

## Development Dependencies

#### 1. **Nodemon**
- **Version**: ^2.0.2
- **Purpose**: Auto-restart Node.js application on file changes
- **Usage**: Development server with hot reload
- **Documentation**: https://nodemon.io/
- **License**: MIT
```json
"scripts": {
  "dev": "nodemon server.js"
}
```

---

## Node.js Built-in Modules

These are core Node.js modules that don't require installation:

#### 1. **path**
- **Purpose**: File and directory path utilities
- **Usage**: Path resolution, joining paths
```javascript
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
```

#### 2. **http**
- **Purpose**: HTTP server and client
- **Usage**: Create HTTP server for Express and Socket.IO
```javascript
const http = require("http");
const server = http.createServer(app);
```

#### 3. **fs (File System)** *(Potential Use)*
- **Purpose**: File system operations
- **Usage**: Reading/writing files (if needed)
```javascript
const fs = require('fs');
```

---

## External CDN Resources

### Cloudflare CDN

All external libraries are served via Cloudflare CDN for:
- High availability
- Global content delivery
- Reduced server load
- Browser caching optimization

**CDN Base URL**: `https://cdnjs.cloudflare.com/`

**Integrity Hashes**: All CDN resources use Subresource Integrity (SRI) hashes for security:
```html
integrity="sha256-mmgLkCYLUQbXn0B1SRqzHar6dCnv9oZFPEC1g1cwlkk="
crossorigin="anonymous"
```

---

## Version Information

### Node.js Environment

```json
{
  "engines": {
    "node": "18"
  }
}
```

**Required**: Node.js version 18.x

### Package Manager

- **npm** (Node Package Manager)
- Version: Compatible with Node 18

---

## Dependency Details

### Backend Stack Summary

| Category | Libraries |
|----------|-----------|
| **Web Framework** | Express.js |
| **Real-Time** | Socket.IO, @socket.io/redis-adapter |
| **Database** | PostgreSQL (pg) |
| **Caching** | Redis |
| **Authentication** | Auth0 (express-openid-connect) |
| **Session Management** | express-session, cookie-parser |
| **Date/Time** | Moment.js |
| **File Upload** | Multer |
| **Configuration** | dotenv |

### Frontend Stack Summary

| Category | Libraries |
|----------|-----------|
| **Real-Time** | Socket.IO Client |
| **URL Parsing** | Qs.js |
| **Icons** | Font Awesome 5 |
| **JavaScript** | Vanilla ES6+ |
| **Styling** | Custom CSS3 |

---

## Installation

### Install All Dependencies

```bash
npm install
```

### Install Production Only

```bash
npm install --production
```

### Install Specific Package

```bash
npm install <package-name>
```

---

## Security Considerations

### 1. **Subresource Integrity (SRI)**
All CDN resources use SRI hashes to prevent tampering:
```html
integrity="sha256-..."
crossorigin="anonymous"
```

### 2. **Environment Variables**
Sensitive data stored in `.env` file (not committed to Git):
- Database credentials
- Auth0 secrets
- Redis connection strings
- API keys

### 3. **Package Updates**
Regular security audits recommended:
```bash
npm audit
npm audit fix
```

---

## Custom Modules

These are local utility modules created for ChatCord:

### 1. **utils/messages.js**
- **Dependencies**: moment
- **Purpose**: Format chat messages with timestamps

### 2. **utils/users.js**
- **Dependencies**: None (pure JavaScript)
- **Purpose**: User state management (join, leave, get users)

### 3. **utils/database.js**
- **Dependencies**: pg (PostgreSQL)
- **Purpose**: Database operations (CRUD for messages, rooms, users)

### 4. **utils/auth.js**
- **Dependencies**: express-openid-connect
- **Purpose**: Auth0 configuration and middleware

### 5. **utils/aiModeration.js**
- **Dependencies**: None (keyword-based)
- **Purpose**: Content moderation using keyword matching
- **Note**: Designed to be extensible for AI APIs (OpenAI, etc.)

---

## Browser Compatibility

### Required Browser Features

Frontend libraries require modern browsers supporting:

- **ECMAScript 2015 (ES6)**
- **WebSocket API** (for Socket.IO)
- **CSS3** (Grid, Flexbox, Animations)
- **Local Storage API**
- **Fetch API**
- **CSS Custom Properties (Variables)**

### Minimum Browser Versions

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

---

## License Information

### Open Source Licenses Used

| Library | License |
|---------|---------|
| Express.js | MIT |
| Socket.IO | MIT |
| PostgreSQL (pg) | MIT |
| Redis | MIT |
| Moment.js | MIT |
| dotenv | BSD-2-Clause |
| express-openid-connect | MIT |
| express-session | MIT |
| cookie-parser | MIT |
| Multer | MIT |
| Qs.js | BSD-3-Clause |
| Font Awesome Free | Font Awesome Free License |
| Nodemon | MIT |

**All dependencies are open source and free for commercial use.**

---

## Updating Dependencies

### Check for Outdated Packages

```bash
npm outdated
```

### Update All Packages

```bash
npm update
```

### Update to Latest (Major Versions)

```bash
npm install <package>@latest
```

### Update package.json

```bash
npx npm-check-updates -u
npm install
```

---

## Alternative Libraries (For Future Consideration)

### Potential Replacements/Additions

1. **Moment.js → Day.js / date-fns**
   - Moment.js is in maintenance mode
   - Day.js: Lighter alternative (2KB)
   - date-fns: Modular date utilities

2. **Redis → Memcached**
   - Alternative caching solution
   - Simpler key-value store

3. **PostgreSQL → MongoDB**
   - NoSQL alternative
   - Document-based storage

4. **Vanilla JS → React/Vue/Svelte**
   - Modern frontend frameworks
   - Component-based architecture
   - Better state management

5. **Font Awesome → Material Icons / Feather Icons**
   - Alternative icon libraries
   - Different design styles

6. **Keyword Moderation → AI APIs**
   - OpenAI Moderation API
   - Perspective API (Google)
   - Azure Content Moderator

---

## Package Scripts

From `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "postinstall": "echo 'Dependencies installed successfully'"
  }
}
```

### Usage

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

---

## Dependency Graph

```
ChatCord Application
│
├── Server (Node.js)
│   ├── Express.js (Web Framework)
│   ├── Socket.IO (Real-time)
│   │   └── @socket.io/redis-adapter
│   ├── PostgreSQL (Database)
│   │   └── pg (Node.js driver)
│   ├── Redis (Caching)
│   ├── Auth0 (Authentication)
│   │   ├── express-openid-connect
│   │   └── express-session
│   ├── Middleware
│   │   └── cookie-parser
│   ├── Utilities
│   │   ├── Moment.js (Dates)
│   │   ├── dotenv (Config)
│   │   └── Multer (File Upload)
│   └── Custom Modules
│       ├── messages.js
│       ├── users.js
│       ├── database.js
│       ├── auth.js
│       └── aiModeration.js
│
└── Client (Browser)
    ├── Socket.IO Client (Real-time)
    ├── Qs.js (URL Parsing)
    ├── Font Awesome (Icons)
    ├── Vanilla JavaScript (Logic)
    └── Custom CSS (Styling)
```

---

## Environment Variables Required

Libraries requiring configuration via environment variables:

### 1. **PostgreSQL (pg)**
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### 2. **Redis**
```env
REDIS_URL=redis://host:port
```

### 3. **Auth0 (express-openid-connect)**
```env
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=your_session_secret
AUTH0_BASE_URL=http://localhost:3000
```

### 4. **Application**
```env
PORT=3000
NODE_ENV=production
SUPERUSERS=admin,username1,username2
```

---

## CDN Fallbacks

Consider implementing CDN fallbacks for production:

```html
<!-- Font Awesome with fallback -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css"
  onerror="this.onerror=null;this.href='/css/fontawesome.min.css';" />

<!-- Qs.js with fallback -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.9.2/qs.min.js"
  onerror="document.write('<script src=\'/js/vendor/qs.min.js\'><\/script>')">
</script>
```

---

## Related Documentation

- [Backend Documentation](BACKEND.md)
- [Frontend Documentation](FRONTEND.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOY_GUIDE.md)
- [Auth0 Setup](AUTH0_SETUP.md)

---

## Support & Resources

### Official Documentation Links

- **Node.js**: https://nodejs.org/docs/
- **npm**: https://docs.npmjs.com/
- **Express**: https://expressjs.com/en/guide/
- **Socket.IO**: https://socket.io/docs/v4/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation
- **Auth0**: https://auth0.com/docs

### Community Resources

- **Stack Overflow**: Tag searches for each library
- **GitHub Issues**: Each library's repository
- **npm Registry**: https://www.npmjs.com/

---

**Last Updated**: October 29, 2025  
**Version**: 1.0  
**Maintainer**: ChatCord Development Team
