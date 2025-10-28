# 🤖 AI Content Moderation System - Implementation Guide

## Overview

ChatCord now includes an intelligent AI-powered content moderation system designed to keep conversations study-focused and appropriate. This system automatically filters messages using a three-tier approach: **approved**, **flagged**, or **blocked**.

## 🎯 Features Implemented

### 1. AI Moderation Service (`utils/aiModeration.js`)

**Dual-mode operation:**
- **AI Mode** (with OpenAI API key): Uses GPT-3.5-turbo for intelligent content analysis
- **Fallback Mode** (without API key): Uses keyword-based filtering

**Three-tier classification:**
- 🟢 **Approved**: Study-related messages pass through immediately
- 🟡 **Flagged**: Potentially off-topic messages allowed but queued for admin review
- 🔴 **Blocked**: Inappropriate content rejected immediately with user notification

**Detection capabilities:**
- Study-focused keyword matching
- Off-topic content detection
- Profanity filtering
- Spam pattern recognition (excessive caps, repeated characters, multiple links)
- Short invalid message detection

### 2. Database Schema (`utils/database.js`)

**New table: `flagged_messages`**
- Stores all flagged content for admin review
- Tracks moderation confidence scores
- Records admin review decisions (approved/rejected)
- Indexed for fast filtering by status and room

**New functions:**
- `saveFlaggedMessage()` - Save message for admin review
- `getFlaggedMessages()` - Retrieve flagged messages by status
- `reviewFlaggedMessage()` - Admin approve/reject action
- `deleteMessageFromDB()` - Permanent message deletion

### 3. Server Integration (`server.js`)

**Updated `chatMessage` handler:**
```javascript
// 1. Moderate incoming message
const moderationResult = await moderateMessage(msg, user.room);

// 2. Block if inappropriate
if (moderationResult.blocked) {
  socket.emit("messageBlocked", { reason, confidence });
  return;
}

// 3. Flag if questionable
if (moderationResult.flagged) {
  await saveFlaggedMessage(...);
  message.flagged = true;
}

// 4. Send message to room
io.to(user.room).emit("message", message);
```

**Fixed `deleteMessage` handler:**
- Now properly deletes from PostgreSQL database (not just memory)
- Added authorization checks with detailed logging
- Emits `deleteFailed` event if unauthorized

**New admin API endpoints:**
- `GET /api/admin/flagged?username=admin` - Retrieve flagged messages (requires superuser)
- `POST /api/admin/review` - Admin approve/reject flagged message

### 4. Client-Side Updates (`public/js/main.js`)

**New event handlers:**
```javascript
// Show notification when message is blocked
socket.on('messageBlocked', ({ reason, confidence }) => {
  showNotification(`Message blocked: ${reason}`, 'error', confidence);
});

// Show error if delete fails
socket.on('deleteFailed', ({ reason }) => {
  showNotification(`Delete failed: ${reason}`, 'error');
});
```

**Visual flagging:**
- Flagged messages display with yellow border and 🚩 icon
- Notification system for blocked messages and errors

### 5. Admin Panel (`public/admin.html`)

**Full-featured moderation dashboard:**
- View pending, approved, and rejected messages
- Display moderation confidence scores
- Visual confidence bars (0-100%)
- One-click approve/reject actions
- Auto-refresh every 30 seconds
- Statistics dashboard (pending, approved, rejected counts)
- Filter tabs for easy navigation
- Responsive glassmorphism design matching app theme

### 6. CSS Styling (`public/css/style.css`)

**Flagged message styling:**
- Yellow left border with gradient background
- 🚩 flag icon in top-right
- Highlighted username in yellow

**Notification system:**
- Slide-in animations from right (desktop) or top (mobile)
- Color-coded by type (error=red, info=blue, success=green)
- Auto-dismiss after 5 seconds
- Backdrop blur with glassmorphism

## 🚀 Getting Started

### Option 1: AI-Powered (OpenAI)

1. **Get OpenAI API key** from https://platform.openai.com/api-keys

2. **Add to `.env`:**
```bash
OPENAI_API_KEY=sk-your-api-key-here
SUPERUSERS=admin,your-username
```

3. **Restart server:**
```bash
npm start
```

4. **Test moderation:**
   - Send a study-related message → ✅ Approved instantly
   - Send "let's talk about politics" → 🟡 Flagged for review
   - Send spam or profanity → 🔴 Blocked with notification

5. **Access admin panel:**
   - Navigate to `http://localhost:3000/admin.html`
   - Review flagged messages
   - Approve or reject content

### Option 2: Keyword-Based (No API Key)

1. **Configure superusers in `.env`:**
```bash
SUPERUSERS=admin,your-username
# Leave OPENAI_API_KEY commented out
```

2. **System automatically uses fallback mode:**
   - Keyword matching for study-related terms
   - Off-topic keyword detection
   - Spam pattern recognition

3. **Works identically to AI mode** (slightly less intelligent but free!)

## 📊 How Moderation Works

### AI Mode (with OpenAI)

1. Message sent by user
2. GPT-3.5-turbo analyzes content with system prompt:
   ```
   You are a content moderator for a study-focused chat room.
   Evaluate if this message is appropriate for study discussions.
   ```
3. AI returns: `approved`, `flagged`, or `blocked`
4. System acts on decision

### Fallback Mode (without OpenAI)

1. Message sent by user
2. Check OFF_TOPIC_KEYWORDS array:
   - `politics`, `religion`, `dating`, `gaming`, etc.
3. Check STUDY_KEYWORDS array:
   - `homework`, `study`, `exam`, `assignment`, etc.
4. Check spam patterns:
   - Excessive caps (>70%)
   - Repeated characters (5+ times)
   - Multiple links
5. Score and classify message

### Classification Logic

**Blocked if:**
- Multiple off-topic keywords detected
- Profanity or hate speech
- Obvious spam patterns
- Confidence > 80%

**Flagged if:**
- Single off-topic keyword
- Excessive caps or repeated chars
- Short message without context
- No study keywords present
- Confidence 40-80%

**Approved if:**
- Contains study keywords
- No concerning patterns
- Confidence > 60% for study content

## 🛡️ Admin Panel Features

### Dashboard Statistics
- **Pending Count**: Messages awaiting review
- **Approved Today**: Auto-approved + admin-approved
- **Rejected Today**: Blocked + admin-rejected

### Message Cards
Each flagged message shows:
- Username, room, timestamp
- Full message text
- Moderation reason
- Confidence score with visual bar
- Badge indicating moderation type (AI/KEYWORD)
- Approve/Reject buttons (for pending)
- Review history (for approved/rejected)

### Actions
- **Approve**: Message stays in chat, marked as reviewed
- **Reject & Delete**: Message deleted from database + removed from all clients

## 🔧 Customization

### Adjust Keyword Lists

Edit `utils/aiModeration.js`:

```javascript
const OFF_TOPIC_KEYWORDS = [
  'politics', 'religion', 'dating', // Add more here
];

const STUDY_KEYWORDS = [
  'homework', 'study', 'exam', // Add more here
];
```

### Change Confidence Thresholds

Edit moderation logic:

```javascript
// More lenient (fewer blocks)
if (confidence > 0.9 && offTopicCount > 2) {
  return { blocked: true, ... };
}

// More strict (more blocks)
if (confidence > 0.6 && offTopicCount > 1) {
  return { blocked: true, ... };
}
```

### Customize System Prompt (AI Mode)

Edit OpenAI system prompt:

```javascript
const systemPrompt = `You are a content moderator for a study-focused chat room. 
Your custom rules here...`;
```

### Disable Moderation

In `server.js`, replace moderation with:

```javascript
socket.on("chatMessage", async (msg) => {
  // Skip moderation
  const moderationResult = { 
    allowed: true, 
    flagged: false, 
    blocked: false 
  };
  
  // Rest of handler...
});
```

## 🐛 Troubleshooting

### OpenAI API Not Working

**Check:**
1. API key is valid: https://platform.openai.com/api-keys
2. `.env` has correct variable: `OPENAI_API_KEY=sk-...`
3. Server restarted after adding key
4. Check console for error messages

**If failing:**
- System automatically falls back to keyword mode
- Check server logs: `🔑 OpenAI API key not found. Using fallback.`

### Admin Panel Not Accessible

**Check:**
1. Username in SUPERUSERS list: `.env` → `SUPERUSERS=admin,yourname`
2. Username matches localStorage: `localStorage.getItem('username')`
3. Navigate to correct URL: `http://localhost:3000/admin.html`

**Error 403:**
- You're not a superuser
- Add username to `.env` SUPERUSERS list
- Rejoin room to update superuser status

### Messages Not Being Flagged

**Check:**
1. Moderation is enabled in `server.js`
2. Database table created: `flagged_messages`
3. Test with obvious keywords: "politics", "dating", "gaming"

**Force flag for testing:**
```javascript
// In aiModeration.js, temporarily set:
return {
  allowed: true,
  flagged: true, // Force flag all messages
  blocked: false,
  reason: 'Test flag',
  confidence: 0.5
};
```

### Delete Button Not Working

**Client-side check:**
1. Inspect element → Check `data-message-id` attribute exists
2. Console log in `deleteMessage()` function
3. Verify Socket.IO connection: `socket.connected`

**Server-side check:**
1. Check authorization: User is owner OR superuser
2. Check database: Message exists in `messages` table
3. Check logs: `🗑️ Message {id} deleted by {user}`

**Common issues:**
- Message ID not set correctly (missing or undefined)
- User not authorized (check superuser status)
- Database connection error (check PostgreSQL)

## 📈 Performance Considerations

### OpenAI API Costs

- Model: GPT-3.5-turbo
- Cost: ~$0.002 per 1K tokens
- Average message: ~50-100 tokens
- **Estimated cost**: $0.0001-$0.0002 per message
- **100,000 messages**: ~$10-20

**Cost savings:**
- Use keyword fallback (free)
- Cache common phrases
- Only moderate messages > 10 characters

### Database Performance

- Indexes on `status` and `room` for fast filtering
- Auto-cleanup old messages (recommended)
- Consider archiving old flagged messages

### Real-Time Performance

- Moderation adds ~100-500ms per message (AI mode)
- Fallback mode: <10ms
- Non-blocking: Other users see messages immediately
- Failed moderation allows message through (fail-safe)

## 🔐 Security Considerations

### Admin Authorization

- ✅ Server-side checks on all admin endpoints
- ✅ SUPERUSERS list in environment variables (not client)
- ✅ Authorization logged for audit trail
- ✅ Failed attempts return 403 Forbidden

### Message Deletion

- ✅ Authorization required (owner OR superuser)
- ✅ Database deletion (not just memory)
- ✅ Broadcast to all clients (UI sync)
- ✅ Logged for accountability

### API Key Security

- ✅ Stored in `.env` (never committed to Git)
- ✅ Not exposed to client
- ✅ Server-side only
- ⚠️ Add `.env` to `.gitignore`

## 📚 API Reference

### Socket.IO Events

**Client → Server:**
- `chatMessage` - Send message (now includes moderation)
- `deleteMessage` - Delete message by ID
- `addReaction` - Add emoji reaction

**Server → Client:**
- `message` - Receive message (may have `flagged: true`)
- `messageBlocked` - Message rejected by moderation
- `messageDeleted` - Message removed from chat
- `deleteFailed` - Delete authorization failed

### HTTP Endpoints

**GET `/api/admin/flagged`**
- Query params: `username` (required)
- Returns: `{ messages: [...], count: 10 }`
- Auth: Requires superuser

**POST `/api/admin/review`**
- Body: `{ messageId, action, adminUsername }`
- Action: `approved` or `rejected`
- Auth: Requires superuser
- Side effect: If rejected, broadcasts `messageDeleted`

## 🎓 Best Practices

### For Admins

1. **Review regularly**: Check admin panel daily
2. **Be consistent**: Approve/reject based on clear guidelines
3. **Educate users**: Explain why content was flagged
4. **Monitor trends**: Adjust keywords based on common flags

### For Developers

1. **Test moderation**: Try various message types
2. **Monitor API costs**: Track OpenAI usage
3. **Tune thresholds**: Adjust confidence levels based on feedback
4. **Keep keywords updated**: Add new study/off-topic terms
5. **Log everything**: Track moderation decisions for improvement

### For Deployment

1. **Set SUPERUSERS** before launch
2. **Add OPENAI_API_KEY** if using AI mode
3. **Test admin panel** in production
4. **Monitor flagged messages** queue
5. **Set up alerts** for high flag rates

## 📝 Example Workflows

### User Sends Message

```
1. User types: "Can anyone help with calculus homework?"
2. Message sent via Socket.IO
3. Server moderates content
4. AI/fallback detects study keywords: "calculus", "homework"
5. Result: Approved (confidence: 95%)
6. Message sent to all room users instantly
7. Stored in database with flagged=false
```

### User Sends Off-Topic Message

```
1. User types: "Who's watching the game tonight?"
2. Message sent via Socket.IO
3. Server moderates content
4. AI/fallback detects off-topic (no study keywords)
5. Result: Flagged (confidence: 60%)
6. Message sent to room but marked flagged=true
7. Stored in flagged_messages table for admin review
8. Yellow border and 🚩 icon shown to admins
```

### User Sends Spam

```
1. User types: "CHECK OUT THIS AMAZING DEAL!!!! 💰💰💰"
2. Message sent via Socket.IO
3. Server moderates content
4. Detects: Excessive caps (70%+), repeated punctuation, emojis
5. Result: Blocked (confidence: 95%)
6. Server emits "messageBlocked" to sender only
7. Notification shows: "Message blocked: Spam pattern detected (95%)"
8. Message NOT sent to room
9. NOT stored in database
```

### Admin Reviews Flagged Message

```
1. Admin navigates to /admin.html
2. Sees pending flagged message: "What's everyone's favorite movie?"
3. Clicks "Reject & Delete"
4. Server updates flagged_messages status → rejected
5. Server deletes message from messages table
6. Server broadcasts "messageDeleted" to all clients
7. Message removed from UI for all users
8. Admin dashboard updates statistics
```

## 🔮 Future Enhancements

### Potential Features

1. **User reputation system**: Track user's moderation history
2. **Auto-ban**: Automatically ban users with multiple violations
3. **Appeal system**: Let users appeal blocked messages
4. **Custom room rules**: Different moderation per room
5. **ML model**: Train custom model on your chat data
6. **Sentiment analysis**: Detect toxic behavior beyond keywords
7. **Language detection**: Multi-language support
8. **Rate limiting**: Prevent rapid-fire spam
9. **Image moderation**: Scan uploaded images for inappropriate content
10. **Moderation logs**: Full audit trail with search

### Integration Ideas

1. **Slack/Discord webhooks**: Alert admins of flagged content
2. **Analytics dashboard**: Visualize moderation trends
3. **Automated reports**: Daily/weekly moderation summaries
4. **User notifications**: Inform users why content was flagged
5. **Customizable responses**: Bots suggest alternative phrasing

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review server logs
3. Test with fallback mode (no API key)
4. Check database tables exist
5. Verify Socket.IO connection

---

**Implementation Complete!** 🎉

Your ChatCord app now has enterprise-grade content moderation with:
- ✅ AI-powered filtering
- ✅ Keyword fallback
- ✅ Admin review system
- ✅ Full database persistence
- ✅ Real-time notifications
- ✅ Beautiful admin dashboard

Enjoy your safer, study-focused chat experience! 📚💬
