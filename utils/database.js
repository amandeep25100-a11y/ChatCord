const { Pool } = require('pg');

/**
 * PostgreSQL Database Configuration for Render
 * 
 * RENDER SETUP:
 * 1. Render automatically provides DATABASE_URL environment variable
 * 2. Format: postgresql://user:password@host:port/database
 * 3. SSL is automatically enabled in production (NODE_ENV=production)
 * 
 * LOCAL DEVELOPMENT:
 * - App works without DATABASE_URL (graceful degradation)
 * - To use local PostgreSQL, add to .env:
 *   DATABASE_URL=postgresql://localhost:5432/chatcord
 * 
 * FEATURES:
 * - Automatic table creation on startup
 * - Message persistence with timestamp
 * - Room-based message history
 * - Optimized with database indexes
 */

// Render PostgreSQL connection
// DATABASE_URL is automatically provided by Render when you add PostgreSQL
let pool = null;

// Only create pool if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Log connection status (helps with debugging)
  console.log('📊 PostgreSQL connection pool created');
}

// Initialize database tables
async function initDatabase() {
  if (!pool) {
    console.log('⚠️  No DATABASE_URL found - running without persistence (OK for local testing)');
    return;
  }
  
  const client = await pool.connect();
  try {
    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        message_text TEXT,
        image_url TEXT,
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        time VARCHAR(20) NOT NULL
      );
    `);

    // Create index on room for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room);
    `);

    // Create index on timestamp for ordering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
    `);

    // Create flagged messages table for admin review
    await client.query(`
      CREATE TABLE IF NOT EXISTS flagged_messages (
        id SERIAL PRIMARY KEY,
        message_id VARCHAR(255) UNIQUE NOT NULL,
        room VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        message_text TEXT NOT NULL,
        reason TEXT NOT NULL,
        confidence DECIMAL(3,2),
        moderation_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        reviewed_by VARCHAR(255),
        reviewed_at TIMESTAMP,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on status for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_status ON flagged_messages(status);
    `);

    // Create index on room
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flagged_room ON flagged_messages(room);
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    client.release();
  }
}

// Get recent messages for a room (last 100)
async function getRoomMessages(room, limit = 100) {
  if (!pool) return []; // No database, return empty history
  
  try {
    const result = await pool.query(
      'SELECT username, message_text as text, image_url, message_type, time FROM messages WHERE room = $1 ORDER BY timestamp ASC LIMIT $2',
      [room, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Save a message to database
async function saveMessage(room, username, text, imageUrl, messageType, time) {
  if (!pool) return; // No database, skip saving
  
  try {
    await pool.query(
      'INSERT INTO messages (room, username, message_text, image_url, message_type, time) VALUES ($1, $2, $3, $4, $5, $6)',
      [room, username, text, imageUrl, messageType, time]
    );
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

// Clean old messages (optional - keep only last 1000 per room)
async function cleanOldMessages(room, keepCount = 1000) {
  if (!pool) return; // No database, skip cleanup
  
  try {
    await pool.query(`
      DELETE FROM messages
      WHERE id IN (
        SELECT id FROM messages
        WHERE room = $1
        ORDER BY timestamp DESC
        OFFSET $2
      )
    `, [room, keepCount]);
  } catch (error) {
    console.error('Error cleaning old messages:', error);
  }
}

// Save flagged message for admin review
async function saveFlaggedMessage(messageId, room, username, text, reason, confidence, moderationType) {
  if (!pool) return; // No database, skip saving
  
  try {
    await pool.query(
      `INSERT INTO flagged_messages 
       (message_id, room, username, message_text, reason, confidence, moderation_type, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       ON CONFLICT (message_id) DO NOTHING`,
      [messageId, room, username, text, reason, confidence, moderationType]
    );
    console.log(`🚩 Flagged message ${messageId} saved for review`);
  } catch (error) {
    console.error('Error saving flagged message:', error);
  }
}

// Get flagged messages for admin review
async function getFlaggedMessages(status = 'pending', limit = 50) {
  if (!pool) return [];
  
  try {
    const result = await pool.query(
      `SELECT * FROM flagged_messages 
       WHERE status = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [status, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    return [];
  }
}

// Review flagged message (approve/reject)
async function reviewFlaggedMessage(messageId, action, adminUsername) {
  if (!pool) return;
  
  try {
    await pool.query(
      `UPDATE flagged_messages 
       SET status = $1, reviewed_by = $2, reviewed_at = NOW() 
       WHERE message_id = $3`,
      [action, adminUsername, messageId]
    );
    console.log(`✅ Message ${messageId} reviewed: ${action}`);
  } catch (error) {
    console.error('Error reviewing flagged message:', error);
  }
}

// Delete message from database permanently
async function deleteMessageFromDB(messageId) {
  if (!pool) return;
  
  try {
    await pool.query(
      'DELETE FROM messages WHERE time = $1',
      [messageId]
    );
    console.log(`🗑️ Message ${messageId} deleted from database`);
  } catch (error) {
    console.error('Error deleting message from database:', error);
  }
}

module.exports = {
  pool,
  initDatabase,
  getRoomMessages,
  saveMessage,
  cleanOldMessages,
  saveFlaggedMessage,
  getFlaggedMessages,
  reviewFlaggedMessage,
  deleteMessageFromDB
};
