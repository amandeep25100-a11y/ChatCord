# 🎯 Quick Start Guide

## For Developers

### Local Development (5 minutes)

```powershell
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/chatcord.git
cd chatcord

# 2. Install dependencies
npm install

# 3. Create .env file (optional - works without it)
copy .env.example .env

# 4. Start the server
npm run dev

# 5. Open browser
# Go to: http://localhost:3000
```

**That's it!** The app works without PostgreSQL for local testing.

---

## Deploy to Production (5 minutes)

### Prerequisites
- GitHub account
- Render account (free - sign up at https://render.com)

### Fastest Way: Blueprint Deploy

```powershell
# 1. Push to GitHub
git add .
git commit -m "Ready for Render"
git push

# 2. Deploy with Blueprint
# Open: https://dashboard.render.com/select-repo?type=blueprint
# Select your repository
# Click "Apply"
# Wait 3-5 minutes
# Done! 🎉
```

**Your app is now live with PostgreSQL!**

---

## Alternative: Manual Deploy

See [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) for detailed step-by-step instructions.

---

## Testing Your Deployed App

1. **Open your app URL** (e.g., `https://chatcord-xyz.onrender.com`)
2. **Enter username** and choose a room (e.g., "JavaScript")
3. **Send messages** - they appear instantly
4. **Open in another browser** - messages sync in real-time
5. **Close all browsers**
6. **Rejoin same room** - messages are still there! ✅

---

## What's Included

- ✅ Real-time messaging (Socket.IO)
- ✅ PostgreSQL database (message persistence)
- ✅ Multiple chat rooms
- ✅ User presence (online users list)
- ✅ Beautiful UI (glassmorphism + dark mode)
- ✅ Health check endpoint
- ✅ Auto-deploy on git push
- ✅ Free tier ready

---

## Project Structure

```
chatcord/
├── server.js              # Express + Socket.IO server
├── utils/
│   ├── database.js       # PostgreSQL setup
│   ├── messages.js       # Message formatting
│   └── users.js          # User management
├── public/               # Frontend files
│   ├── index.html       # Landing page
│   ├── chat.html        # Chat interface
│   └── css/js/          # Styles & client logic
├── render.yaml          # Render Blueprint (IaC)
├── schema.sql           # Database schema
└── package.json         # Dependencies
```

---

## Key Files for Render Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Infrastructure definition (auto-creates DB + web service) |
| `schema.sql` | Database schema (auto-applied on startup) |
| `.env.example` | Environment variables template |
| `server.js` | Main application entry point |
| `utils/database.js` | PostgreSQL connection with SSL |

---

## Environment Variables

Render automatically sets these when using Blueprint:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Auto-linked from PostgreSQL service |
| `NODE_ENV` | `production` | Set in render.yaml |
| `PORT` | `10000` | Auto-set by Render |

---

## Free Tier Limits

### Web Service (Free)
- ✅ Unlimited requests
- ✅ 750 hours/month runtime
- ⚠️ Spins down after 15 min inactivity
- ⏱️ Cold start: ~30 seconds

### PostgreSQL (Free)
- ✅ Fully functional database
- ✅ 1GB storage
- ✅ 90 days trial
- ⚠️ Expires after 90 days (upgrade to keep)

### Upgrade Path: $14/month total
- **Web Service Starter**: $7/mo (always on, no cold starts)
- **PostgreSQL Starter**: $7/mo (no expiration, backups)

---

## Common Issues & Solutions

### 1. "App not loading"
- Free tier: Wait 30 seconds for cold start
- Check Render logs for errors

### 2. "Messages not persisting"
- Verify `DATABASE_URL` is set
- Check database is "Available" status

### 3. "Build failed"
- Check Node version (needs v18+)
- Review build logs in Render dashboard

### 4. "Can't connect to database"
- Ensure web service and database in same region
- Verify PostgreSQL is provisioned

---

## Next Steps After Deployment

1. ✅ Share your app URL with friends
2. ✅ Test with multiple users simultaneously
3. 🔧 Add custom domain (paid plan)
4. 🔐 Implement user authentication
5. 📸 Add image upload feature (infrastructure ready)
6. 📊 Add analytics
7. 🎨 Customize UI/themes

---

## Support & Resources

- **Full Deployment Guide**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Render Documentation**: https://render.com/docs
- **Socket.IO Docs**: https://socket.io/docs

---

**Ready to deploy? Just run:**

```powershell
git add .
git commit -m "Deploy ChatCord"
git push
```

Then visit: https://dashboard.render.com/select-repo?type=blueprint

**🚀 Your app will be live in 5 minutes!**
