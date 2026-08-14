-- Additive class grouping for the HappyClass presentation library.
--
-- Safety properties:
--   * No presentation or lesson_by_schedule row is deleted or merged.
--   * Existing presentations remain valid because classId is nullable.
--   * Legacy rows are backfilled only when their lesson maps to exactly one
--     active class. Ambiguous and standalone rows remain Uncategorized.
--   * Safe to run more than once.
--
-- Run after a verified database backup and before deploying the matching
-- backend. The old backend ignores this additive column, which makes rollback
-- to the previous application build safe without reversing this migration.

SET @presentation_class_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presentations'
    AND COLUMN_NAME = 'classId'
);
SET @presentation_class_column_sql = IF(
  @presentation_class_column_exists = 0,
  'ALTER TABLE `presentations` ADD COLUMN `classId` int NULL AFTER `lessonByScheduleId`',
  'SELECT 1'
);
PREPARE presentation_class_column_stmt FROM @presentation_class_column_sql;
EXECUTE presentation_class_column_stmt;
DEALLOCATE PREPARE presentation_class_column_stmt;

SET @presentation_class_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presentations'
    AND INDEX_NAME = 'idx_presentations_classId'
);
SET @presentation_class_index_sql = IF(
  @presentation_class_index_exists = 0,
  'CREATE INDEX `idx_presentations_classId` ON `presentations` (`classId`)',
  'SELECT 1'
);
PREPARE presentation_class_index_stmt FROM @presentation_class_index_sql;
EXECUTE presentation_class_index_stmt;
DEALLOCATE PREPARE presentation_class_index_stmt;

UPDATE `presentations` AS presentation
JOIN (
  SELECT
    candidate.id AS presentationId,
    MIN(schedule_row.classID) AS classId
  FROM `presentations` AS candidate
  JOIN `lesson_by_schedule` AS schedule_row
    ON schedule_row.lessonID = candidate.lessonId
   AND schedule_row.isDelete = 0
  WHERE candidate.classId IS NULL
    AND candidate.lessonId IS NOT NULL
  GROUP BY candidate.id
  HAVING COUNT(DISTINCT schedule_row.classID) = 1
) AS unambiguous_class
  ON unambiguous_class.presentationId = presentation.id
SET presentation.classId = unambiguous_class.classId
WHERE presentation.classId IS NULL;

SELECT
  COUNT(*) AS total_presentations,
  SUM(CASE WHEN classId IS NOT NULL THEN 1 ELSE 0 END) AS classified,
  SUM(CASE WHEN classId IS NULL THEN 1 ELSE 0 END) AS uncategorized
FROM `presentations`
WHERE isDeleted = 0;
