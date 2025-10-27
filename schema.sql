-- ChatCord Database Schema for Render PostgreSQL
-- This will be auto-created by the app, but you can run this manually if needed

-- Messages table with support for text and images
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

-- Optional: Add a function to auto-clean old messages
CREATE OR REPLACE FUNCTION clean_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY room ORDER BY timestamp DESC) as rn
      FROM messages
    ) sub
    WHERE rn > 1000
  );
END;
$$ LANGUAGE plpgsql;
