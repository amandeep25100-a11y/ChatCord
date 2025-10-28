// AI Content Moderation Service
// Uses OpenAI API for content filtering and study-related validation

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Fallback to simple keyword matching if OpenAI is not configured
const OFF_TOPIC_KEYWORDS = [
  'politics', 'political', 'election', 'vote', 'party',
  'religion', 'religious', 'god', 'church', 'mosque', 'temple',
  'hate', 'racist', 'sexist', 'offensive',
  'spam', 'advertisement', 'buy now', 'click here',
  'profanity', 'curse', 'swear'
];

const STUDY_KEYWORDS = [
  'code', 'programming', 'syntax', 'function', 'variable',
  'algorithm', 'debug', 'error', 'help', 'question',
  'learn', 'study', 'tutorial', 'example', 'documentation'
];

/**
 * Moderate message content using AI or fallback keyword matching
 * @param {string} text - Message text to moderate
 * @param {string} room - Chat room name for context
 * @returns {Promise<Object>} - Moderation result
 */
async function moderateMessage(text, room) {
  // If OpenAI API key is configured, use AI moderation
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      return await moderateWithOpenAI(text, room);
    } catch (error) {
      console.error('❌ OpenAI moderation failed, falling back to keyword matching:', error.message);
      return moderateWithKeywords(text, room);
    }
  } else {
    // Fallback to keyword-based moderation
    return moderateWithKeywords(text, room);
  }
}

/**
 * AI-powered moderation using OpenAI GPT
 */
async function moderateWithOpenAI(text, room) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a STRICT content moderator for a ${room} study chat room. This is an EDUCATIONAL platform ONLY.

APPROVE ONLY IF the message is:
- Asking/answering questions about ${room} or studying
- Sharing educational resources, code, or solutions
- Technical discussions directly related to ${room}
- Brief acknowledgments like "thanks", "got it", "hello"

FLAG for human review if:
- Slightly off-topic but not harmful
- Unclear intent
- Contains external links (even educational)

BLOCK immediately if:
- Politics, religion, dating, gaming, entertainment
- Spam, advertisements, self-promotion
- Hate speech, harassment, profanity
- Personal information sharing
- Any non-educational content

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations.
Format: {"status":"approved","reason":"reason here","confidence":0.95}
Status must be exactly: approved, flagged, or blocked
Reason must be under 40 characters
Confidence must be 0.0 to 1.0`
          },
          {
            role: 'user',
            content: `Moderate: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      allowed: result.status === 'approved',
      flagged: result.status === 'flagged',
      blocked: result.status === 'blocked',
      reason: result.reason,
      confidence: result.confidence,
      moderationType: 'ai'
    };

  } catch (error) {
    console.error('OpenAI moderation error:', error);
    // Fallback to keyword matching
    return moderateWithKeywords(text, room);
  }
}

/**
 * Keyword-based moderation (fallback method)
 */
function moderateWithKeywords(text, room) {
  const lowerText = text.toLowerCase();
  
  // Check for off-topic keywords
  const offTopicMatches = OFF_TOPIC_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  // Check for study-related keywords
  const studyMatches = STUDY_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  // Block if contains multiple off-topic keywords
  if (offTopicMatches.length >= 2) {
    return {
      allowed: false,
      flagged: false,
      blocked: true,
      reason: `Contains off-topic content: ${offTopicMatches.join(', ')}`,
      confidence: 0.8,
      moderationType: 'keyword'
    };
  }
  
  // Flag if contains one off-topic keyword but not study-related
  if (offTopicMatches.length === 1 && studyMatches.length === 0) {
    return {
      allowed: false,
      flagged: true,
      blocked: false,
      reason: `May be off-topic: mentions "${offTopicMatches[0]}"`,
      confidence: 0.6,
      moderationType: 'keyword'
    };
  }
  
  // Check message length (too short might be spam)
  if (text.trim().length < 3 && !/[a-zA-Z0-9]/.test(text)) {
    return {
      allowed: false,
      flagged: true,
      blocked: false,
      reason: 'Message too short or invalid',
      confidence: 0.7,
      moderationType: 'keyword'
    };
  }
  
  // Check for excessive caps (might be shouting/spam)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (text.length > 10 && capsRatio > 0.7) {
    return {
      allowed: false,
      flagged: true,
      blocked: false,
      reason: 'Excessive capitalization detected',
      confidence: 0.6,
      moderationType: 'keyword'
    };
  }
  
  // Check for repeated characters (spam pattern)
  if (/(.)\1{5,}/.test(text)) {
    return {
      allowed: false,
      flagged: true,
      blocked: false,
      reason: 'Repeated character spam detected',
      confidence: 0.8,
      moderationType: 'keyword'
    };
  }
  
  // Allow if contains study keywords or seems normal
  return {
    allowed: true,
    flagged: false,
    blocked: false,
    reason: studyMatches.length > 0 
      ? `Study-related: ${studyMatches.slice(0, 2).join(', ')}` 
      : 'Appears appropriate',
    confidence: studyMatches.length > 0 ? 0.9 : 0.7,
    moderationType: 'keyword'
  };
}

/**
 * Save flagged message for admin review
 */
async function saveFlaggedMessage(messageData, moderationResult) {
  // This will be saved to database for admin review
  return {
    messageId: messageData.id,
    room: messageData.room,
    username: messageData.username,
    text: messageData.text,
    reason: moderationResult.reason,
    confidence: moderationResult.confidence,
    moderationType: moderationResult.moderationType,
    timestamp: new Date().toISOString(),
    status: 'pending_review'
  };
}

module.exports = {
  moderateMessage,
  saveFlaggedMessage
};
