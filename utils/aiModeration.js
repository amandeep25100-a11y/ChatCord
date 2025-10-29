// AI Content Moderation Service
// Uses keyword-based filtering for study-focused content validation

console.log('🔍 Keyword-based moderation system loaded');

// Fallback to simple keyword matching if OpenAI is not configured
const OFF_TOPIC_KEYWORDS = [
  'politics', 'political', 'election', 'vote', 'party',
  'religion', 'religious', 'god', 'church', 'mosque', 'temple',
  'hate', 'racist', 'sexist', 'offensive',
  'spam', 'advertisement', 'buy now', 'click here',
  'profanity', 'curse', 'swear',
  'gaming', 'game', 'fortnite', 'minecraft', 'valorant', 'league of legends',
  'dating', 'relationship', 'girlfriend', 'boyfriend',
  'movie', 'tv show', 'netflix', 'anime',
  'sports', 'football', 'basketball', 'soccer'
];

const STUDY_KEYWORDS = [
  'code', 'programming', 'syntax', 'function', 'variable',
  'algorithm', 'debug', 'error', 'help', 'question',
  'learn', 'study', 'tutorial', 'example', 'documentation'
];

/**
 * Moderate message content using keyword matching
 * @param {string} text - Message text to moderate
 * @param {string} room - Chat room name for context
 * @returns {Promise<Object>} - Moderation result
 */
async function moderateMessage(text, room) {
  console.log(`🔍 Moderating message in ${room}: "${text}"`);
  
  const result = moderateWithKeywords(text, room);
  console.log(`✅ Result: ${result.blocked ? 'BLOCKED' : result.flagged ? 'FLAGGED' : 'APPROVED'} (${result.reason})`);
  return result;
}

/**
 * Keyword-based moderation
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
  
  // Log matches for debugging
  if (offTopicMatches.length > 0) {
    console.log(`   🔍 Off-topic matches found: ${offTopicMatches.join(', ')}`);
  }
  if (studyMatches.length > 0) {
    console.log(`   ✅ Study keywords found: ${studyMatches.join(', ')}`);
  }
  
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
      allowed: true,  // Allow but flag for review
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
      allowed: true,  // Allow but flag for review
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
      allowed: true,  // Allow but flag for review
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
      allowed: true,  // Allow but flag for review
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
