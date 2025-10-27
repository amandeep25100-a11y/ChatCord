# 💬 ChatCord - Real-time Chat Application

A modern real-time chat application with persistent message history, featuring a beautiful glassmorphism UI with neon accents, light/dark mode, and **PostgreSQL database integration** for message persistence.



## ✨ Features

- 💬 **Real-time messaging** using Socket.IO
- 🔐 **Auth0 authentication** - Secure login with Google, GitHub, email/password, etc.
- 🏠 **Multiple chat rooms** with separate conversations
- 👥 **User list** showing who's in each room
- 💾 **Message persistence** with PostgreSQL database
- 📝 **Message history** - last 100 messages per room automatically loaded
- 👤 **User profiles** with avatar and info (when using Auth0)
- 🎨 **Glassmorphism UI** with neon glowing borders
- 🌓 **Light/Dark mode toggle** with localStorage persistence
- ⭐ **Animated starfield** background in dark mode
- 🔄 **Smooth transitions** and hover effects
- 📱 **Responsive design** for mobile and desktop
- 🚀 **Ready for image uploads** (infrastructure in place)
- ✨ **Works with or without Auth0** - graceful degradation

## 🚀 Quick Deploy to Render

### Option A: One-Click Deploy (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the button above (or manually: https://dashboard.render.com/select-repo?type=blueprint)
2. Connect your GitHub repository
3. Render automatically creates:
   - PostgreSQL database
   - Web service
   - Environment variables
4. Wait 3-5 minutes for deployment
5. Done! Your app is live! 🎉

### Option B: Manual Deployment

**See [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) for detailed step-by-step instructions.**

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Authentication**: Auth0 (OpenID Connect)
- **Real-time**: Socket.IO
- **Database**: PostgreSQL (via node-postgres)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Render (with PostgreSQL support)

## 📦 Installation & Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL (optional for local testing - app works without it)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/chatcord.git
cd chatcord
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your configuration:
# - DATABASE_URL (optional for local - app works without it)
# - Auth0 credentials (optional - see AUTH0_SETUP.md)
```

4. **(Optional) Set up Auth0 authentication**
```powershell
# Quick setup with interactive script
.\setup-auth0.ps1

# Or follow the detailed guide
# See AUTH0_SETUP.md for complete instructions
```

5. **Run the application**
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## 🗄️ Database Setup

The app automatically creates the necessary tables on startup. If you want to manually set up the database:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d chatcord

# Run the schema
\i schema.sql
```

## 📁 Project Structure

```
chatcord/
├── public/                # Static files served to client
│   ├── chat.html         # Chat room interface
│   ├── index.html        # Landing page
│   ├── css/
│   │   └── style.css     # Glassmorphism styles
│   └── js/
│       └── main.js       # Client-side Socket.IO logic
├── utils/                # Server utilities
│   ├── auth.js           # Auth0 authentication middleware
│   ├── database.js       # PostgreSQL connection & queries
│   ├── messages.js       # Message formatting
│   └── users.js          # User management (in-memory)
├── server.js             # Main Express + Socket.IO server
├── schema.sql            # Database schema
├── render.yaml           # Render Blueprint (IaC)
├── setup-auth0.ps1       # Auth0 setup helper script
├── package.json          # Node.js dependencies
├── .env.example          # Environment variables template
├── AUTH0_SETUP.md        # Auth0 configuration guide
├── DEPLOY_GUIDE.md       # Detailed deployment guide
└── README.md             # This file
```

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (`development` or `production`) | No |
| `DATABASE_URL` | PostgreSQL connection string | No* |
| `AUTH0_SECRET` | Random secret for Auth0 sessions (32+ chars) | No** |
| `AUTH0_BASE_URL` | Your app URL (e.g., `http://localhost:3000`) | No** |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | No** |
| `AUTH0_ISSUER_BASE_URL` | Auth0 domain (e.g., `https://dev-xxx.auth0.com`) | No** |

\* The app works without `DATABASE_URL` but won't persist messages  
\** Auth0 variables are optional - app works without authentication

## 🔐 Auth0 Setup

For secure authentication with social login support:

1. **Quick Setup** (Interactive):
   ```powershell
   .\setup-auth0.ps1
   ```

2. **Detailed Guide**:
   See [AUTH0_SETUP.md](./AUTH0_SETUP.md) for complete step-by-step instructions

3. **Features with Auth0**:
   - Secure login/logout
   - Social providers (Google, GitHub, etc.)
   - User profiles with avatars
   - Protected routes
   - Auto-fill username from profile

## 📝 Notes

- The `_html_css` folder contains the original tutorial template and is not part of the production app
- Messages are automatically cleaned up (keeps last 1000 per room)
- Free tier Render PostgreSQL databases expire after 90 days
- Free tier web services spin down after 15 minutes of inactivity
- Auth0 free tier: 7,000 active users/month



5. Click **"Create Web Service"**## Message Persistence



### Step 4: Wait for Deployment



- Build takes ~2-5 minutesMessages are automatically saved to `data/messages.json`:## Local Development

- Database tables auto-create on first run

- Your app will be live at: `https://chatcord-XXXX.onrender.com`- ✅ Last 100 messages per room are kept



### Step 5: Test Your App- ✅ Messages persist across server restarts```bash



1. Open your Render URL- ✅ New users see chat history when joiningnpm install

2. Join a room and send messages

3. **Close browser and rejoin** → messages persist! ✅- ✅ Lightweight JSON file storage (no database needed)npm start

4. Check Render Dashboard → PostgreSQL → Data tab to see stored messages

```

## ✨ Features

## Deployment to Render

- 💬 Real-time messaging (Socket.IO)

- 💾 PostgreSQL persistence on RenderGo to `http://localhost:3000`

- 🎨 Glassmorphism UI with neon glows

- 🌓 Light/Dark mode toggle1. **Push to GitHub**

- 📷 **Image support ready** (schema includes image_url)

- 🏠 Multiple chat rooms```bash## Deployment Guide

- 👥 Live user list

- 📝 Auto-stores last 100 messages per roomgit init



## 🗄️ Database Schemagit add .### Important: Socket.IO Server Deployment



Messages table:git commit -m "ChatCord with persistence"

- `id` - Auto-increment primary key

- `room` - Room namegit remote add origin YOUR_GITHUB_REPO_URL⚠️ **Firebase Hosting only serves static files.** Your Socket.IO server (`server.js`) needs a compute platform.

- `username` - User who sent message

- `message_text` - Text contentgit push -u origin master

- `image_url` - Image URL (for future image support)

- `message_type` - 'text', 'image', or 'system'```### Recommended: Deploy to Render (Full Stack)

- `timestamp` - Server timestamp

- `time` - Formatted time string



## 🔧 Local Development2. **Deploy on Render****Easiest option - deploys frontend + backend together:**



### Option 1: Without Database (Testing UI)   - Go to https://render.com



```bash   - Click "New +" → "Web Service"1. **Push your code to GitHub**

npm install

npm start   - Connect your GitHub repository   ```bash

```

   - Configure:   git init

Messages won't persist locally, but app works for UI testing.

     - **Name**: chatcord   git add .

### Option 2: With Local PostgreSQL

     - **Build Command**: `npm install`   git commit -m "Ready for deployment"

1. Install PostgreSQL locally

2. Create database:     - **Start Command**: `npm start`   git remote add origin YOUR_GITHUB_REPO_URL

```sql

createdb chatcord   - Click "Create Web Service"   git push -u origin master

```

   - Live at `https://chatcord-XXXX.onrender.com`   ```

3. Create `.env` file:

```

DATABASE_URL=postgresql://localhost:5432/chatcord

NODE_ENV=development## Tech Stack2. **Deploy on Render**

PORT=3000

```   - Go to https://render.com and sign up



4. Run:- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript   - Click "New +" → "Web Service"

```bash

npm install- **Backend**: Node.js, Express, Socket.IO   - Connect your GitHub repository

npm start

```- **Persistence**: JSON file storage   - Configure:



## 📊 Render PostgreSQL Features     - **Name**: chatcord



**Free Tier:**## License     - **Build Command**: `npm install`

- 256 MB RAM

- 1 GB Storage     - **Start Command**: `npm start`

- Expires after 90 days (upgrade to keep)

- Perfect for development/testingMIT     - **Instance Type**: Free



**Paid Tier ($7/month):**   - Click "Create Web Service"

- 1 GB RAM   - Wait for deployment (5-10 minutes)

- 10 GB Storage   - Your app will be live at `https://chatcord-XXXX.onrender.com`

- Daily backups

- No expiration3. **Done!** Your full-stack chat app is live.

- Better performance

### Alternative: Firebase Hosting (Frontend) + Render (Backend)

## 🔐 Security Notes

If you want to use Firebase for static files:

- Database URL is automatically secured by Render

- SSL enabled by default**Step 1: Deploy Backend to Render** (same as above)

- Internal database URL only accessible from your Render services

- External database URL available for migrations/admin tools**Step 2: Update Socket.IO Connection**



## 📝 Environment Variables on RenderEdit `public/js/main.js` line 11:

```javascript

Required:// Change from:

- `DATABASE_URL` - PostgreSQL connection string (auto from Render DB)const socket = io();

- `NODE_ENV` - Set to `production`

// To (use your Render URL):

Optional:const socket = io('https://your-app.onrender.com');

- `PORT` - Auto-set by Render (don't override)```



## 🐛 TroubleshootingAlso update `server.js` CORS settings:

```javascript

**Issue**: "Database connection failed"const io = socketio(server, {

- Check DATABASE_URL is set correctly in Render dashboard  cors: {

- Ensure database and web service are in same region    origin: "https://your-firebase-app.web.app",

- Use **Internal Database URL**, not External    methods: ["GET", "POST"]

  }

**Issue**: "Tables not created"});

- Check Render logs: Dashboard → Your Service → Logs```

- Database auto-initializes on first message

- Or run schema.sql manually in Render DB Data tab**Step 3: Deploy Frontend to Firebase**

```bash

**Issue**: "App crashes on startup"npm install -g firebase-tools

- Check `npm install` completed successfully in build logsfirebase login

- Verify all dependencies in package.jsonfirebase init hosting

- Check for Node.js version compatibility (using Node 18)# Public directory: public

# Single-page app: No

## 🎯 Next: Add Image Upload

firebase deploy --only hosting

Schema is ready for images! To implement:```

1. Add multer/cloudinary for image uploads

2. Store image URL in `image_url` column### Railway Alternative

3. Update client to display images

4. All database code already supports itDeploy to Railway instead of Render:



## 📚 Render Resources1. Go to https://railway.app

2. Click "Start a New Project"

- Dashboard: https://dashboard.render.com3. Select "Deploy from GitHub repo"

- PostgreSQL Docs: https://render.com/docs/databases4. Connect your repository

- Web Service Docs: https://render.com/docs/web-services5. Railway auto-detects Node.js and deploys

- Support: https://render.com/support6. Done!



## 💰 Cost Estimate## Environment Variables



**Free Tier (Both Free):**For production, create `.env`:

- Web Service: Free (spins down after 15 min inactivity)```

- PostgreSQL: Free (90-day limit)PORT=3000

- **Total: $0/month**NODE_ENV=production

```

**Production (Recommended):**

- Web Service: $7/month (always on)## Tech Stack

- PostgreSQL: $7/month (persistent, backups)

- **Total: $14/month**- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript

- **Backend**: Node.js, Express, Socket.IO

## 📄 Project Structure- **Deployment**: Render / Railway / Firebase Hosting



```## Commands

chatcord/

├── public/              # Frontend```bash

│   ├── chat.htmlnpm install      # Install dependencies

│   ├── index.htmlnpm start        # Start server

│   ├── css/style.cssnpm run dev      # Start with nodemon (auto-reload)

│   └── js/main.js```

├── utils/

│   ├── database.js      # PostgreSQL queries## Project Structure

│   ├── messages.js

│   └── users.js```

├── server.js            # Socket.IO + Expresschatcord/

├── schema.sql           # Database schema├── public/              # Static files

├── .env.example         # Environment template│   ├── chat.html       # Chat room page

└── package.json│   ├── index.html      # Join page

```│   ├── css/style.css   # Glassmorphism styles

│   └── js/main.js      # Client + theme logic

## 🚀 Auto-Deploy Updates├── utils/              # Server utilities

│   ├── messages.js

After initial setup, just push to GitHub:│   └── users.js

```bash├── server.js           # Socket.IO server

git add .├── package.json

git commit -m "Update feature"└── firebase.json       # Firebase config (optional)

git push```

```

## Notes

Render automatically rebuilds and redeploys! 🎉

- The `_html_css` folder is a starter template (not part of the app)

## License- Redis adapter code is commented out for simpler deployment

- Works on free tiers of Render/Railway

MIT

## Original Tutorial

Based on Brad Traversy's tutorial: https://www.youtube.com/watch?v=jD7FnbI76Hg

Enhanced with glassmorphism theme and deployment configs.

## License

MIT
