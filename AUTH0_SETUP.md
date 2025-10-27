# 🔐 Auth0 Setup Guide for ChatCord

This guide will walk you through setting up Auth0 authentication for your ChatCord application.

---

## 📋 What You'll Get

- ✅ Secure login/logout system
- ✅ Support for multiple login providers (Google, GitHub, email/password, etc.)
- ✅ User profile management
- ✅ Protected routes
- ✅ Session management
- ✅ Works seamlessly with or without Auth0 configured

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Auth0 Account (5 minutes)**

1. **Go to Auth0**
   - Visit: https://auth0.com
   - Click **"Sign Up"** (top right)

2. **Create Account**
   - Sign up with Google, GitHub, or email
   - Choose **"Personal"** account type
   - Complete the registration

3. **Choose Region**
   - Select the region closest to you
   - Click **"Create Account"**

---

### **Step 2: Create Application (3 minutes)**

1. **Access Dashboard**
   - After login, you'll see the Auth0 Dashboard
   - Click **"Applications"** in the left sidebar
   - Click **"Create Application"**

2. **Configure Application**
   - **Name**: `ChatCord`
   - **Application Type**: Select **"Regular Web Applications"**
   - Click **"Create"**

3. **Choose Technology**
   - Select **"Node.js (Express)"**
   - Click **"Continue"** or **"Skip Integration"**

---

### **Step 3: Configure Application Settings (5 minutes)**

1. **Go to Settings Tab**
   - Click on your **ChatCord** application
   - Click the **"Settings"** tab

2. **Copy Credentials**
   You'll need these values (keep this tab open):
   
   - **Domain**: `your-domain.auth0.com` (copy this)
   - **Client ID**: `abc123...` (copy this)
   - **Client Secret**: `xyz789...` (copy this)

3. **Configure URLs**
   Scroll down to **"Application URIs"** section:

   **For Local Development:**
   ```
   Allowed Callback URLs:
   http://localhost:3000/callback

   Allowed Logout URLs:
   http://localhost:3000

   Allowed Web Origins:
   http://localhost:3000
   ```

   **For Production (Render):**
   ```
   Allowed Callback URLs:
   http://localhost:3000/callback, https://your-app.onrender.com/callback

   Allowed Logout URLs:
   http://localhost:3000, https://your-app.onrender.com

   Allowed Web Origins:
   http://localhost:3000, https://your-app.onrender.com
   ```

   Replace `your-app.onrender.com` with your actual Render URL.

4. **Save Changes**
   - Scroll to the bottom
   - Click **"Save Changes"**

---

### **Step 4: Enable Social Connections (Optional - 2 minutes)**

Want users to login with Google, GitHub, etc.?

1. **Go to Authentication → Social**
   - Click **"Authentication"** in left sidebar
   - Click **"Social"**

2. **Enable Providers**
   - Toggle on: **Google** (most common)
   - Toggle on: **GitHub** (for developers)
   - Toggle on: **Microsoft**
   - Or any other provider you want

3. **Configure (if needed)**
   - Most providers work out-of-the-box in development
   - For production, you may need to create apps in each provider
   - Auth0 will guide you through this

---

### **Step 5: Configure Your ChatCord App (5 minutes)**

1. **Create `.env` file**
   
   In your ChatCord folder, copy `.env.example` to `.env`:
   
   ```powershell
   copy .env.example .env
   ```

2. **Edit `.env` file**
   
   Open `.env` and fill in these values (from Auth0 dashboard):

   ```bash
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # PostgreSQL (optional for local)
   DATABASE_URL=postgresql://localhost:5432/chatcord

   # Auth0 Configuration
   AUTH0_SECRET='your-long-random-string-here-min-32-characters'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_CLIENT_ID='your-client-id-from-auth0'
   AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
   ```

   **How to fill each field:**

   - **AUTH0_SECRET**: Generate a random string (32+ characters)
     ```powershell
     # Windows PowerShell - generate random secret
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
     ```
     Copy the output and use it as AUTH0_SECRET

   - **AUTH0_BASE_URL**: For local = `http://localhost:3000`
   
   - **AUTH0_CLIENT_ID**: Copy from Auth0 Dashboard → Applications → ChatCord → Settings → Client ID
   
   - **AUTH0_ISSUER_BASE_URL**: Copy Domain from Auth0, add `https://` before it
     - Example: If Domain is `dev-abc123.us.auth0.com`
     - Use: `https://dev-abc123.us.auth0.com`

3. **Save the file**

---

### **Step 6: Install Dependencies & Test (2 minutes)**

1. **Install New Dependencies**
   
   ```powershell
   npm install
   ```

2. **Start the Server**
   
   ```powershell
   npm run dev
   ```

3. **Test Authentication**
   
   - Open: http://localhost:3000
   - You should see the "Secure Login" section
   - Click **"Login with Auth0"**
   - You'll be redirected to Auth0
   - Login with your account (or create one)
   - You'll be redirected back to ChatCord
   - Your profile should appear! 🎉

---

## 🌐 Deploy to Render with Auth0

### **Step 1: Update Render Environment Variables**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on your **chatcord** web service

2. **Add Environment Variables**
   - Click **"Environment"** in left sidebar
   - Click **"Add Environment Variable"**
   
   Add these 4 variables:

   | Key | Value |
   |-----|-------|
   | `AUTH0_SECRET` | Your random secret (same as local) |
   | `AUTH0_BASE_URL` | `https://your-app.onrender.com` |
   | `AUTH0_CLIENT_ID` | Your Client ID from Auth0 |
   | `AUTH0_ISSUER_BASE_URL` | `https://your-domain.auth0.com` |

3. **Save Changes**
   - Click **"Save Changes"**
   - Render will automatically redeploy

---

### **Step 2: Update Auth0 Production URLs**

1. **Go back to Auth0 Dashboard**
   - Applications → ChatCord → Settings

2. **Add Production URLs**
   
   In **"Application URIs"** section, add your Render URLs:

   ```
   Allowed Callback URLs:
   http://localhost:3000/callback, https://your-app.onrender.com/callback

   Allowed Logout URLs:
   http://localhost:3000, https://your-app.onrender.com

   Allowed Web Origins:
   http://localhost:3000, https://your-app.onrender.com
   ```

   Replace `your-app.onrender.com` with your actual Render URL.

3. **Save Changes**

---

## ✅ Testing Authentication

### **Local Testing**
1. Visit http://localhost:3000
2. Click "Login with Auth0"
3. Login/signup
4. Verify profile shows on homepage
5. Join a chat room
6. Check /profile page
7. Test logout

### **Production Testing**
1. Visit your Render URL
2. Same steps as local
3. Verify everything works

---

## 🎨 Features Available

### **For All Users (With or Without Auth0)**
- ✅ Join chat rooms
- ✅ Send/receive messages
- ✅ Real-time updates
- ✅ Message persistence

### **With Auth0 Enabled**
- ✅ Secure login/logout
- ✅ Profile page with user info
- ✅ Auto-fill username from profile
- ✅ User avatar display
- ✅ Protected routes
- ✅ Session management

### **Without Auth0 Configured**
- ✅ App works normally
- ✅ Guest access
- ✅ Manual username entry
- ✅ All chat features available

---

## 🔧 Troubleshooting

### **"Callback URL mismatch" Error**
- Check Auth0 Dashboard → Applications → Settings
- Verify "Allowed Callback URLs" includes your URL
- Format: `http://localhost:3000/callback` (local) or `https://your-app.onrender.com/callback` (prod)

### **"Invalid state" Error**
- Clear browser cookies
- Check AUTH0_SECRET is set correctly
- Verify it's 32+ characters

### **Login Loop**
- Check AUTH0_BASE_URL matches your actual URL
- No trailing slash
- Include protocol (http:// or https://)

### **"Application not found"**
- Verify AUTH0_CLIENT_ID is correct
- Check AUTH0_ISSUER_BASE_URL includes https://

### **Auth0 Not Loading**
- Check all 4 environment variables are set
- Restart server after changing .env
- Check server logs for errors

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   - It's already in `.gitignore`
   - Never share your secrets publicly

2. **Use Strong Secrets**
   - AUTH0_SECRET should be 32+ random characters
   - Generate a new one for production

3. **HTTPS in Production**
   - Always use `https://` for AUTH0_BASE_URL in production
   - Render provides this automatically

4. **Limit Allowed URLs**
   - Only add URLs you actually use
   - Remove test URLs in production

---

## 📊 Auth0 Free Tier Limits

- ✅ 7,000 active users (MAU)
- ✅ Unlimited logins
- ✅ Social connections included
- ✅ Password-based authentication
- ✅ Email/password signup
- ✅ Sufficient for most apps!

**Paid plans start at $23/month if you need more features**

---

## 🎯 Quick Reference

### **Auth0 Dashboard URLs**
- Main Dashboard: https://manage.auth0.com/dashboard
- Applications: https://manage.auth0.com/dashboard/us/YOUR_TENANT/applications
- Social Connections: https://manage.auth0.com/dashboard/us/YOUR_TENANT/connections/social

### **Important Files**
- `.env` - Local environment variables
- `utils/auth.js` - Auth0 middleware
- `server.js` - Auth0 integration
- `public/index.html` - Login UI

### **API Endpoints**
- `/login` - Redirects to Auth0 login
- `/logout` - Logs user out
- `/callback` - Auth0 callback handler
- `/profile` - Protected user profile page
- `/api/user` - Get current user info (JSON)

---

## 🚀 You're Done!

Your ChatCord app now has:
- ✅ Secure authentication with Auth0
- ✅ Login/logout system
- ✅ User profiles
- ✅ Social login support
- ✅ Works with or without Auth0

**Test it locally, then deploy to Render!**

---

## 📞 Need Help?

- **Auth0 Docs**: https://auth0.com/docs
- **Auth0 Community**: https://community.auth0.com
- **ChatCord Issues**: Check server logs and Auth0 dashboard

---

**Happy Authenticating! 🔐**
