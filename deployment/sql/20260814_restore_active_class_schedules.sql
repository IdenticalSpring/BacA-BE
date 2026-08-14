-- Restore the audited Wednesday schedule used by HG064 and RM663.
--
-- Production audit on 2026-08-14 found schedule 23 (Wednesday 17:30-19:30)
-- soft-deleted while two active class_schedule rows still reference it:
-- HG064 and RM663. This prevented future Wednesday lesson slots from being
-- generated for both classes.
--
-- Safety properties:
--   * No lesson_by_schedule, lesson, homework, or check-in row is changed.
--   * No row is deleted or merged.
--   * The UPDATE is intentionally restricted to schedule 23, its audited
--     weekday/time, and exactly the two audited active class references.
--   * Safe to run more than once.

SELECT
  schedule_entity.id AS schedule_id,
  schedule_entity.dayOfWeek,
  schedule_entity.startTime,
  schedule_entity.endTime,
  COUNT(DISTINCT class_schedule_entity.classID) AS active_class_count
FROM `schedule` AS schedule_entity
JOIN `class_schedule` AS class_schedule_entity
  ON class_schedule_entity.scheduleID = schedule_entity.id
 AND class_schedule_entity.isDelete = 0
JOIN `class` AS class_entity
  ON class_entity.id = class_schedule_entity.classID
 AND class_entity.isDelete = 0
WHERE schedule_entity.id = 23
  AND schedule_entity.dayOfWeek = 4
  AND schedule_entity.startTime = '17:30:00'
  AND schedule_entity.endTime = '19:30:00'
  AND schedule_entity.isDelete = 1
GROUP BY
  schedule_entity.id,
  schedule_entity.dayOfWeek,
  schedule_entity.startTime,
  schedule_entity.endTime;

UPDATE `schedule` AS schedule_entity
SET schedule_entity.isDelete = 0
WHERE schedule_entity.id = 23
  AND schedule_entity.dayOfWeek = 4
  AND schedule_entity.startTime = '17:30:00'
  AND schedule_entity.endTime = '19:30:00'
  AND schedule_entity.isDelete = 1
  AND 2 = (
    SELECT COUNT(*)
    FROM `class_schedule` AS class_schedule_entity
    JOIN `class` AS class_entity
      ON class_entity.id = class_schedule_entity.classID
     AND class_entity.isDelete = 0
    WHERE class_schedule_entity.scheduleID = schedule_entity.id
      AND class_schedule_entity.isDelete = 0
      AND class_entity.accessId IN ('HG064', 'RM663')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `class_schedule` AS unexpected_class_schedule
    JOIN `class` AS unexpected_class
      ON unexpected_class.id = unexpected_class_schedule.classID
     AND unexpected_class.isDelete = 0
    WHERE unexpected_class_schedule.scheduleID = schedule_entity.id
      AND unexpected_class_schedule.isDelete = 0
      AND unexpected_class.accessId NOT IN ('HG064', 'RM663')
  );

SELECT ROW_COUNT() AS restored_schedule_count;

SELECT
  schedule_entity.id AS schedule_id,
  schedule_entity.dayOfWeek,
  schedule_entity.startTime,
  schedule_entity.endTime,
  schedule_entity.isDelete
FROM `schedule` AS schedule_entity
WHERE schedule_entity.id = 23;
