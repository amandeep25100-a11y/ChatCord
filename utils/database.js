const { Pool } = require('pg');

// Render PostgreSQL connection
// DATABASE_URL is automatically provided by Render when you add PostgreSQL
let pool = null;

// Only create pool if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
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

module.exports = {
  pool,
  initDatabase,
  getRoomMessages,
  saveMessage,
  cleanOldMessages
};
