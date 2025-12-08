-- ============================================
-- AI Chatbot Setup - Database Migration
-- ============================================
-- Run Date: 2025-12-08
-- Description: Create AI Bot Teacher account and update chat table

-- Step 1: Create AI Bot Teacher Account
-- This creates a special teacher with ID 97777 that represents the AI
INSERT INTO teacher (id, name, username, password, level, startDate, isDelete)
VALUES (
  97777,
  'AI Teaching Assistant',
  'ai_bot_97777',
  '$2b$10$invalidHashForSecurityNotForLogin12345',  -- Invalid hash, cannot login
  'AI',
  NOW(),
  0
)
ON DUPLICATE KEY UPDATE
  name = 'AI Teaching Assistant',
  username = 'ai_bot_97777',
  level = 'AI',
  isDelete = 0;

-- Step 2: Verify AI Bot was created
SELECT 
  id, 
  name, 
  username, 
  level, 
  startDate,
  isDelete
FROM teacher 
WHERE id = 97777;

-- Expected Output:
-- +-------+-----------------------+------------+-------+------------+----------+
-- | id    | name                  | username   | level | startDate  | isDelete |
-- +-------+-----------------------+------------+-------+------------+----------+
-- | 97777 | AI Teaching Assistant | ai_bot_97777| AI   | 2025-12-08 |    0     |
-- +-------+-----------------------+------------+-------+------------+----------+

-- Step 3: Add new columns to chat table (if not exists)
-- Note: TypeORM should auto-sync these, but run manually if needed

ALTER TABLE chat 
ADD COLUMN IF NOT EXISTS isAI TINYINT(1) DEFAULT 0 AFTER isRead;

ALTER TABLE chat 
ADD COLUMN IF NOT EXISTS senderID INT NULL AFTER isAI;

-- Step 4: Create index for faster AI message queries
CREATE INDEX idx_chat_isAI ON chat(isAI);
CREATE INDEX idx_chat_senderID ON chat(senderID);

-- Step 5: Verify table structure
DESCRIBE chat;

-- Expected to see:
-- +------------+---------------------------+------+-----+---------+----------------+
-- | Field      | Type                      | Null | Key | Default | Extra          |
-- +------------+---------------------------+------+-----+---------+----------------+
-- | id         | int                       | NO   | PRI | NULL    | auto_increment |
-- | message    | text                      | YES  |     | NULL    |                |
-- | audioUrl   | varchar(255)              | YES  |     | NULL    |                |
-- | imageUrl   | text                      | YES  |     | NULL    |                |
-- | isRevoked  | tinyint                   | NO   |     | 0       |                |
-- | isRead     | tinyint                   | NO   |     | 0       |                |
-- | isAI       | tinyint                   | NO   | MUL | 0       |                |
-- | senderID   | int                       | YES  | MUL | NULL    |                |
-- | createdAt  | timestamp                 | NO   |     | CURRENT_TIMESTAMP |       |
-- +------------+---------------------------+------+-----+---------+----------------+

-- Step 6: Optional - Update existing messages with senderID
-- This backfills senderID for old messages (optional)

UPDATE chat c
INNER JOIN student s ON c.studentId = s.id
SET c.senderID = s.id
WHERE c.senderRole = 'student' AND c.senderID IS NULL;

UPDATE chat c
INNER JOIN teacher t ON c.teacherId = t.id
SET c.senderID = t.id
WHERE c.senderRole = 'teacher' AND c.senderID IS NULL;

-- Step 7: Test Query - Find all AI messages
SELECT 
  id,
  message,
  audioUrl,
  isAI,
  senderID,
  senderRole,
  createdAt
FROM chat
WHERE isAI = 1
ORDER BY createdAt DESC
LIMIT 10;

-- Step 8: Test Query - Find messages from AI Bot
SELECT 
  c.id,
  c.message,
  c.audioUrl,
  c.isAI,
  t.name AS teacher_name,
  c.createdAt
FROM chat c
LEFT JOIN teacher t ON c.senderID = t.id
WHERE c.senderID = 97777
ORDER BY c.createdAt DESC
LIMIT 10;

-- ============================================
-- Rollback Script (if needed)
-- ============================================

-- Remove AI Bot (use with caution)
-- DELETE FROM teacher WHERE id = 97777;

-- Remove columns (WARNING: this deletes data)
-- ALTER TABLE chat DROP COLUMN isAI;
-- ALTER TABLE chat DROP COLUMN senderID;

-- Remove indexes
-- DROP INDEX idx_chat_isAI ON chat;
-- DROP INDEX idx_chat_senderID ON chat;

-- ============================================
-- Validation Queries
-- ============================================

-- Count AI messages
SELECT COUNT(*) AS total_ai_messages FROM chat WHERE isAI = 1;

-- Count messages by sender type
SELECT 
  senderRole,
  isAI,
  COUNT(*) AS message_count
FROM chat
GROUP BY senderRole, isAI;

-- Check AI Bot recent activity
SELECT 
  DATE(createdAt) AS date,
  COUNT(*) AS ai_messages_count
FROM chat
WHERE senderID = 97777
GROUP BY DATE(createdAt)
ORDER BY date DESC
LIMIT 7;

-- ============================================
-- Performance Monitoring
-- ============================================

-- Check table size
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name = 'chat';

-- Check index usage
SHOW INDEX FROM chat;

-- ============================================
-- NOTES
-- ============================================
-- 1. Always backup database before running migration
-- 2. Test in development environment first
-- 3. AI Bot cannot login (password hash is invalid)
-- 4. senderID 97777 identifies all AI messages
-- 5. isAI flag allows quick filtering of AI vs human messages
