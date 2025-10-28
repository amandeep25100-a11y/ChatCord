# 🚀 Environment Variables Setup for Render

## ⚠️ Important: Local vs Production Environment Variables

Your local `.env` file is **NOT pushed to GitHub** (and shouldn't be!). This means Render doesn't have access to your environment variables.

You need to manually add them in Render's dashboard.

## 📋 Step-by-Step: Add Environment Variables to Render

### 1. Access Your Render Dashboard

1. Go to: https://dashboard.render.com
2. Log in to your account
3. Select your **ChatCord** web service

### 2. Navigate to Environment Variables

1. In the left sidebar, click **"Environment"**
2. You'll see a list of current environment variables
3. Click **"Add Environment Variable"** button

### 3. Add Required Variables

Add each of these variables one by one:

#### ✅ SUPERUSERS (Required)
```
Key: SUPERUSERS
Value: admin,your-username
```
**Purpose**: Controls who can access the admin panel and delete messages

#### 🤖 OPENAI_API_KEY (Optional but Recommended)
```
Key: OPENAI_API_KEY
Value: YOUR_OPENAI_API_KEY_HERE
```
**Purpose**: Enables AI-powered content moderation
**Note**: Without this, the system falls back to keyword-based moderation (still works!)

#### 🔧 NODE_ENV (Optional)
```
Key: NODE_ENV
Value: production
```
**Purpose**: Optimizes Node.js for production

#### 🔐 Auth0 Variables (If using Auth0)
```
Key: AUTH0_SECRET
Value: SXGvf8D4AWxa9hY5eup6dgmRyzQnTKVjH0icblIkUL2OZowM

Key: AUTH0_BASE_URL
Value: https://your-app-name.onrender.com

Key: AUTH0_CLIENT_ID
Value: Clx7d4whPaWA4YeEuKQ7ghxXgaD8kIZD

Key: AUTH0_ISSUER_BASE_URL
Value: https://dev-ucvvicvvdwpqwj26.us.auth0.com
```
**Note**: Update `AUTH0_BASE_URL` to your actual Render URL!

### 4. Save and Deploy

1. Click **"Save Changes"** at the bottom
2. Render will automatically trigger a **redeploy**
3. Wait 2-3 minutes for deployment to complete
4. Your app will now have access to the environment variables! ✅

## 🎯 Quick Checklist

Before deploying, ensure you've added:

- [ ] `SUPERUSERS` - At least one admin username
- [ ] `OPENAI_API_KEY` - Your OpenAI API key (optional)
- [ ] `NODE_ENV` - Set to "production"
- [ ] `AUTH0_BASE_URL` - Updated to Render URL (if using Auth0)

**Do NOT add:**
- ❌ `DATABASE_URL` - Render automatically sets this
- ❌ `PORT` - Render automatically sets this

## 🔍 Verify Environment Variables

After deployment, check if variables are set:

### Method 1: Check Render Logs

1. Go to **"Logs"** tab in Render
2. Look for startup messages:
   - `🤖 Using OpenAI moderation` - API key is set ✅
   - `🔑 OpenAI API key not found. Using fallback.` - API key missing ❌

### Method 2: Test Functionality

1. **Test AI Moderation**:
   - Send a spam message: "CHECK THIS OUT!!!"
   - Should be blocked with notification ✅

2. **Test Admin Panel**:
   - Navigate to `https://your-app.onrender.com/admin.html`
   - Enter your SUPERUSER username
   - Should see admin dashboard ✅

## 🐛 Troubleshooting

### Issue: "OpenAI API key not found" in logs

**Solution:**
1. Verify you added `OPENAI_API_KEY` in Render Environment tab
2. Check for typos in the key name (must be exact)
3. Click "Save Changes" after adding
4. Wait for automatic redeploy

### Issue: Admin panel shows 403 Forbidden

**Solution:**
1. Verify `SUPERUSERS` variable is set in Render
2. Value should be comma-separated usernames (no spaces)
3. Example: `admin,john,sarah`
4. Redeploy after adding

### Issue: AI moderation not working in production

**Solution:**
```
Check Render Logs for:
- "🤖 Using OpenAI moderation" ✅ API key working
- "🔑 OpenAI API key not found" ❌ Add OPENAI_API_KEY
- "OpenAI API error" ❌ Check API key is valid
```

Verify API key at: https://platform.openai.com/api-keys

### Issue: Auth0 redirect error

**Solution:**
1. Update `AUTH0_BASE_URL` to your Render URL
2. Update Auth0 dashboard:
   - Allowed Callback URLs: `https://your-app.onrender.com/callback`
   - Allowed Logout URLs: `https://your-app.onrender.com`

## 💡 Best Practices

### Security
- ✅ **Never commit `.env` to GitHub** (already in `.gitignore`)
- ✅ **Never share API keys publicly**
- ✅ **Rotate keys if accidentally exposed**
- ✅ **Use different keys for local vs production** (recommended)

### Cost Management
- 💰 **Monitor OpenAI usage**: https://platform.openai.com/usage
- 💰 **Set spending limits** in OpenAI dashboard
- 💰 **GPT-3.5-turbo costs**: ~$0.0001-0.0002 per message
- 💰 **Estimated**: 100,000 messages = $10-20

### Deployment
- 🚀 **Environment changes trigger redeploy** automatically
- 🚀 **Code changes require git push** to trigger deploy
- 🚀 **Database migrations** run automatically on deploy

## 📸 Visual Guide

### Where to Find Environment Variables in Render:

```
Render Dashboard
└── Your Web Service (ChatCord)
    └── Environment (tab in left sidebar)
        ├── Add Environment Variable (button)
        ├── Key: [input field]
        └── Value: [input field]
```

### After Adding Variables:

```
Environment Variables:
✅ OPENAI_API_KEY     sk-proj-oCSs... (hidden)
✅ SUPERUSERS         admin,john
✅ NODE_ENV           production
✅ DATABASE_URL       postgresql://... (auto-set by Render)
```

## 🔄 Updating Variables

To change an environment variable:

1. Go to **Environment** tab
2. Find the variable you want to change
3. Click **"Edit"** button
4. Update the value
5. Click **"Save Changes"**
6. Render will **automatically redeploy** ✅

**Note**: Changes to environment variables always trigger a redeploy!

## 🧪 Testing After Deployment

### Test 1: AI Moderation Works
```bash
# Send via your deployed app:
"CHECK THIS OUT!!!"

# Expected: Message blocked notification
```

### Test 2: Admin Panel Access
```bash
# Navigate to:
https://your-app.onrender.com/admin.html

# Expected: Admin dashboard loads
```

### Test 3: Check Logs
```bash
# In Render Logs tab, look for:
"🤖 Using OpenAI moderation"
"✅ Connected to database"
"🚀 Server running on port 10000"
```

## 📞 Need Help?

If you're still having issues:

1. **Check Render Logs** - Most errors appear here
2. **Verify variable names** - Must match exactly
3. **Try manual redeploy** - Sometimes helps
4. **Test locally first** - Ensure `.env` works locally

---

## ✅ Quick Copy-Paste for Render

```
# Required
SUPERUSERS=admin,your-username

# Optional but recommended
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Production optimization
NODE_ENV=production
```

**Important**: Update `SUPERUSERS` with your actual username!

---

**Your local `.env` is working! ✅**  
**Now add these same variables to Render for production deployment! 🚀**
