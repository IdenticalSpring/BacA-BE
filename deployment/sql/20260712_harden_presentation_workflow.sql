-- Additive hardening for the HappyClass presentation workflow.
-- Run after 20260707_create_presentation_tables.sql and before deploying the matching backend.

SET @presentation_version_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presentations'
    AND COLUMN_NAME = 'version'
);
SET @presentation_version_sql = IF(
  @presentation_version_column_exists = 0,
  'ALTER TABLE `presentations` ADD COLUMN `version` int NOT NULL DEFAULT 1 AFTER `language`',
  'SELECT 1'
);
PREPARE presentation_version_stmt FROM @presentation_version_sql;
EXECUTE presentation_version_stmt;
DEALLOCATE PREPARE presentation_version_stmt;

UPDATE `presentations`
SET `version` = 1
WHERE `version` IS NULL OR `version` < 1;

SET @presentation_owner_lesson_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presentations'
    AND INDEX_NAME = 'idx_presentations_owner_lesson_active'
);
SET @presentation_owner_lesson_index_sql = IF(
  @presentation_owner_lesson_index_exists = 0,
  'CREATE INDEX `idx_presentations_owner_lesson_active` ON `presentations` (`ownerRole`, `ownerId`, `lessonId`, `isDeleted`, `updatedAt`)',
  'SELECT 1'
);
PREPARE presentation_owner_lesson_index_stmt FROM @presentation_owner_lesson_index_sql;
EXECUTE presentation_owner_lesson_index_stmt;
DEALLOCATE PREPARE presentation_owner_lesson_index_stmt;
