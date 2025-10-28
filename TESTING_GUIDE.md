# 🧪 Testing Guide - AI Moderation & Admin Features

## Quick Start Testing

### 1. Setup Test Environment

```powershell
# Make sure you're in the ChatCord directory
cd c:\ChatCord

# Install any missing dependencies (should already be installed)
npm install

# Start the server
npm start
```

### 2. Configure Superuser

Open `.env` and ensure you have a superuser set:

```bash
SUPERUSERS=admin,testuser
```

## 🧪 Test Scenarios

### Test 1: Normal Study Message (Should be Approved ✅)

**Steps:**
1. Open `http://localhost:3000`
2. Username: `testuser`, Room: `JavaScript`
3. Send message: `"Can anyone help with my calculus homework?"`

**Expected Result:**
- ✅ Message appears immediately
- ✅ No border or flag icon
- ✅ Message saved to database

### Test 2: Off-Topic Message (Should be Flagged 🟡)

**Steps:**
1. Send message: `"What's everyone's favorite movie?"`

**Expected Result:**
- 🟡 Message appears with yellow left border
- 🟡 Small 🚩 icon in top-right corner
- 🟡 Message saved to `flagged_messages` table
- 🟡 Visible in admin panel

### Test 3: Spam Message (Should be Blocked 🔴)

**Steps:**
1. Send message: `"CHECK OUT THIS LINK!!! AMAZING DEAL!!!"`

**Expected Result:**
- 🔴 Message does NOT appear in chat
- 🔴 Notification pops up: "Message blocked: Spam pattern detected"
- 🔴 Confidence score shown in notification
- 🔴 NOT saved to database

### Test 4: Admin Panel Access

**Steps:**
1. Navigate to `http://localhost:3000/admin.html`
2. When prompted, enter username: `admin` (or your SUPERUSER name)

**Expected Result:**
- ✅ Admin dashboard loads with glassmorphism theme
- ✅ Statistics show: Pending, Approved, Rejected counts
- ✅ Pending tab shows flagged message from Test 2
- ✅ Message card displays reason, confidence, user, room, time

### Test 5: Admin Review - Approve

**Steps:**
1. In admin panel, find flagged message
2. Click "Approve" button

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Message status updated to "approved"
- ✅ Message moves to "Approved" tab
- ✅ Statistics update
- ✅ Message remains in chat room

### Test 6: Admin Review - Reject

**Steps:**
1. Send another off-topic message: `"Let's talk about politics"`
2. Go to admin panel (should see new pending message)
3. Click "Reject & Delete" button

**Expected Result:**
- 🔴 Confirmation dialog appears
- 🔴 Message status updated to "rejected"
- 🔴 Message deleted from database
- 🔴 Message removed from chat room UI (all users)
- 🔴 Statistics update

### Test 7: Message Deletion - Owner

**Steps:**
1. As `testuser`, send message: `"This is my test message"`
2. Hover over your message → 🗑️ icon appears
3. Click delete icon

**Expected Result:**
- ✅ Confirmation dialog: "Are you sure?"
- ✅ Message deleted from chat
- ✅ Message removed from database
- ✅ All users see message disappear

### Test 8: Message Deletion - Admin

**Steps:**
1. Open two browser windows:
   - Window 1: User `alice`
   - Window 2: User `admin` (superuser)
2. As `alice`, send message: `"Hello from Alice"`
3. As `admin`, hover over Alice's message → 🗑️ icon appears
4. Click delete icon

**Expected Result:**
- ✅ Admin can delete any user's message
- ✅ Message deleted from both windows
- ✅ Server logs: `🗑️ Message {id} deleted by admin`

### Test 9: Message Deletion - Unauthorized

**Steps:**
1. Open two browser windows:
   - Window 1: User `alice`
   - Window 2: User `bob` (NOT superuser)
2. As `alice`, send message: `"Hello from Alice"`
3. As `bob`, try to see delete button on Alice's message

**Expected Result:**
- ❌ Delete button NOT visible to `bob` (only emoji button)
- ❌ If manually triggered (console), server returns error
- ❌ Notification: "Delete failed: Not authorized"

### Test 10: AI Mode vs Fallback Mode

**Test AI Mode (with OpenAI):**

1. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-real-key-here
   ```

2. Restart server
3. Check logs: `🤖 Using OpenAI moderation`
4. Send message: `"Let's play video games"`
5. Check admin panel for AI confidence score (usually 70-95%)

**Test Fallback Mode (without OpenAI):**

1. Comment out in `.env`:
   ```bash
   # OPENAI_API_KEY=sk-...
   ```

2. Restart server
3. Check logs: `🔑 OpenAI API key not found. Using fallback.`
4. Send message: `"Let's play video games"`
5. Check admin panel for keyword confidence score (usually 50-80%)

### Test 11: Emoji Reactions

**Steps:**
1. Send message: `"Great explanation, thanks!"`
2. Hover over message → 😊 button appears
3. Click emoji button → picker appears
4. Click 👍 emoji

**Expected Result:**
- ✅ Reaction appears below message
- ✅ Count shows "1"
- ✅ Clicking again removes your reaction

### Test 12: Theme Toggle

**Steps:**
1. Click theme toggle button (🌗/🌙 in top bar)

**Expected Result:**
- ✅ Theme switches between light/dark
- ✅ Preference saved to localStorage
- ✅ Reloading page remembers choice

## 🔍 Database Verification

### Check Messages Table

```powershell
# Connect to PostgreSQL
psql -U your_username -d chatcord

# Query messages
SELECT id, username, room, text, flagged FROM messages ORDER BY timestamp DESC LIMIT 10;
```

**Expected:**
- Approved messages: `flagged = false`
- Flagged messages: `flagged = true`
- Blocked messages: NOT in table

### Check Flagged Messages Table

```sql
SELECT message_id, username, message_text, reason, confidence, status 
FROM flagged_messages 
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected:**
- All flagged messages present
- Status: `pending`, `approved`, or `rejected`
- Confidence scores 0.00 - 1.00

### Check Deletion

```sql
-- Send a test message
-- Note its message_id
-- Delete via UI
-- Then query:
SELECT * FROM messages WHERE id = 'message_id_here';
```

**Expected:**
- No rows returned (message deleted)

## 🐛 Common Issues & Fixes

### Issue: Admin panel shows 403 Forbidden

**Fix:**
```bash
# Check .env
SUPERUSERS=admin,your-username

# Ensure username matches localStorage
# In browser console:
localStorage.getItem('username')

# Restart server
npm start
```

### Issue: Messages not being moderated

**Fix:**
```javascript
// Check server.js has moderation code
// Look for:
const moderationResult = await moderateMessage(msg, user.room);

// Check logs for errors:
// - OpenAI API errors
// - Database connection errors
```

### Issue: Delete button not working

**Fix:**
```javascript
// In browser console:
const messageEl = document.querySelector('.message');
console.log(messageEl.dataset.messageId); // Should show ID

// If undefined, check server.js:
// message.id should be set before emitting
```

### Issue: Notifications not appearing

**Fix:**
```css
/* Check CSS loaded */
/* Inspect element, look for .notification class */

/* Check z-index not blocked */
.notification {
  z-index: 10000 !important;
}
```

### Issue: OpenAI moderation not working

**Fix:**
```bash
# Verify API key valid
# Test at: https://platform.openai.com/api-keys

# Check .env format
OPENAI_API_KEY=sk-abc123...  # No quotes, no spaces

# Check server logs
# Should see: "🤖 Using OpenAI moderation"
# Or: "🔑 OpenAI API key not found. Using fallback."

# Restart server after changes
npm start
```

## 📊 Performance Testing

### Test Message Throughput

```javascript
// In browser console:
for (let i = 0; i < 10; i++) {
  socket.emit('chatMessage', `Test message ${i}`);
}
```

**Expected:**
- All 10 messages moderated
- Response time: <500ms per message (AI mode)
- Response time: <50ms per message (fallback mode)
- No messages lost

### Test Concurrent Users

1. Open 5 browser tabs
2. Join same room with different usernames
3. All users send messages simultaneously
4. Check all messages appear for all users

**Expected:**
- All messages delivered
- Moderation works for all
- No lag or disconnections

### Test Admin Panel Performance

1. Generate 50+ flagged messages (send off-topic)
2. Open admin panel
3. Switch between tabs (Pending/Approved/Rejected)

**Expected:**
- Loads in <2 seconds
- Smooth tab switching
- No browser freezing

## ✅ Acceptance Criteria

### Feature Complete Checklist

- [ ] AI moderation blocks spam messages
- [ ] AI moderation flags off-topic messages
- [ ] AI moderation approves study messages
- [ ] Fallback mode works without OpenAI
- [ ] Admin panel accessible by superusers
- [ ] Admin can approve flagged messages
- [ ] Admin can reject and delete messages
- [ ] Users can delete own messages
- [ ] Admins can delete any message
- [ ] Delete removes from database
- [ ] Notifications show for blocked messages
- [ ] Flagged messages have visual indicator
- [ ] Emoji reactions work
- [ ] Theme toggle works
- [ ] Database tables auto-create
- [ ] All messages persist across restarts

### Security Checklist

- [ ] Admin endpoints require authorization
- [ ] SUPERUSERS list stored server-side only
- [ ] OpenAI API key not exposed to client
- [ ] Delete actions logged for audit
- [ ] Unauthorized deletes return 403
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (no innerHTML for user content)

## 🚀 Production Readiness

### Pre-Deploy Checklist

- [ ] Set production SUPERUSERS in Render
- [ ] Add OPENAI_API_KEY to Render (if using AI)
- [ ] Test on staging environment
- [ ] Verify database migrations run
- [ ] Test admin panel in production
- [ ] Monitor first 24h for issues
- [ ] Set up error logging
- [ ] Document moderation guidelines for admins

### Post-Deploy Testing

1. **Smoke Test** (5 minutes)
   - [ ] Join a room
   - [ ] Send message
   - [ ] Delete message
   - [ ] Access admin panel

2. **Full Test** (30 minutes)
   - [ ] Run all test scenarios above
   - [ ] Monitor server logs
   - [ ] Check database records
   - [ ] Verify no errors in console

3. **User Acceptance** (ongoing)
   - [ ] Gather feedback on moderation
   - [ ] Adjust keywords if needed
   - [ ] Monitor false positives/negatives
   - [ ] Tune confidence thresholds

## 📝 Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Local/Staging/Production]

Test 1: Normal Study Message
Status: [ ] Pass [ ] Fail
Notes: 

Test 2: Off-Topic Message  
Status: [ ] Pass [ ] Fail
Notes:

Test 3: Spam Message
Status: [ ] Pass [ ] Fail
Notes:

Test 4: Admin Panel Access
Status: [ ] Pass [ ] Fail
Notes:

Test 5: Admin Approve
Status: [ ] Pass [ ] Fail
Notes:

Test 6: Admin Reject
Status: [ ] Pass [ ] Fail
Notes:

Test 7: Message Delete (Owner)
Status: [ ] Pass [ ] Fail
Notes:

Test 8: Message Delete (Admin)
Status: [ ] Pass [ ] Fail
Notes:

Test 9: Message Delete (Unauthorized)
Status: [ ] Pass [ ] Fail
Notes:

Test 10: AI vs Fallback
Status: [ ] Pass [ ] Fail
Notes:

Overall Status: [ ] All Pass [ ] Needs Fixes
Next Steps:
```

---

**Happy Testing!** 🧪✅

All features have been implemented and are ready to test. Follow this guide to verify everything works correctly before deploying to production.
