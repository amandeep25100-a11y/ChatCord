# ChatCord - Deploy to Render with PostgreSQL# ChatCord - Realtime Chat with Message Persistence# ChatCord - Realtime Chat Application# ChatCord App



Real-time chat app with **Render PostgreSQL** for persistent message storage (text + images ready).



## 🚀 Deploy to Render (Complete Guide)A real-time chat application with room support, featuring a futuristic glassmorphism UI with neon accents, light/dark mode toggle, and **persistent message history**.Realtime chat app with websockets using Node.js, Express and Socket.io with Vanilla JS on the frontend with a custom UI



### Step 1: Push to GitHub



```bash## FeaturesA real-time chat application with room support, featuring a futuristic glassmorphism UI with neon accents and light/dark mode toggle.[![Run on Repl.it](https://repl.it/badge/github/bradtraversy/chatcord)](https://repl.it/github/bradtraversy/chatcord)

cd chatcord

git init

git add .

git commit -m "ChatCord with PostgreSQL ready"- 🎨 Glassmorphism UI with neon glowing borders## Usage

git remote add origin YOUR_GITHUB_REPO_URL

git push -u origin master- 🌓 Light/Dark mode toggle with localStorage persistence

```

- 💬 Real-time messaging using Socket.IO## Features```

### Step 2: Create PostgreSQL Database on Render

- 💾 **Message persistence** - chat history saved to disk

1. Go to https://render.com and sign in

2. Click **"New +"** → **"PostgreSQL"**- 🏠 Multiple chat roomsnpm install

3. Configure:

   - **Name**: `chatcord-db`- 👥 User list per room

   - **Database**: `chatcord`

   - **User**: `chatcord_user` (auto-generated)- ⭐ Animated starfield in dark mode- 🎨 Glassmorphism UI with neon glowing bordersnpm run dev

   - **Region**: Choose closest to you

   - **Instance Type**: **Free** (or paid for production)- 🔄 Smooth transitions and hover effects

4. Click **"Create Database"**

5. Wait ~2 minutes for database to provision- 📝 Last 100 messages per room automatically saved- 🌓 Light/Dark mode toggle with localStorage persistence

6. **Copy the "Internal Database URL"** (starts with `postgresql://`)



### Step 3: Deploy Web Service on Render

## Local Development- 💬 Real-time messaging using Socket.IOGo to localhost:3000

1. Click **"New +"** → **"Web Service"**

2. Connect your GitHub repository

3. Configure:

   - **Name**: `chatcord````bash- 🏠 Multiple chat rooms```

   - **Region**: Same as your database

   - **Branch**: `master`npm install

   - **Build Command**: `npm install`

   - **Start Command**: `npm start`npm start- 👥 User list per room

   - **Instance Type**: **Free** (or paid)

```

4. **Add Environment Variable:**

   - Click **"Advanced"** → **"Add Environment Variable"**- ⭐ Animated starfield in dark mode## Notes

   - **Key**: `DATABASE_URL`

   - **Value**: Paste the Internal Database URL from Step 2Go to `http://localhost:3000`

   - **Key**: `NODE_ENV`

   - **Value**: `production`- 🔄 Smooth transitions and hover effectsThe *_html_css* folder is just a starter template to follow along with the tutorial at https://www.youtube.com/watch?v=jD7FnbI76Hg&t=1339s. It is not part of the app



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
