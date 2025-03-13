-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for schooldb
CREATE DATABASE IF NOT EXISTS `schooldb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `schooldb`;

-- Dumping structure for table schooldb.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.assessments
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.class
CREATE TABLE IF NOT EXISTS `class` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  -- `startDate` date NOT NULL,
  -- `endDate` date DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  `teacherID` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `teacherID` (`teacherID`),
  CONSTRAINT `class_ibfk_1` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Data exporting was unselected.

-- Dumping structure for table schooldb.lesson
CREATE TABLE IF NOT EXISTS `lesson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `link` text,
  `description` text,
  `level` varchar(50) DEFAULT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.schedule
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `dayOfWeek` TINYINT NOT NULL CHECK (`dayOfWeek` BETWEEN 1 AND 7),
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `class_schedule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `classID` INT NOT NULL,
  `scheduleID` INT NOT NULL,
  `lessonID` INT NOT NULL, -- Thêm lessonID vào để đảm bảo mỗi lịch học của lớp có một bài giảng
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  KEY `classID` (`classID`),
  KEY `scheduleID` (`scheduleID`),
  KEY `lessonID` (`lessonID`),
  CONSTRAINT `class_schedule_ibfk_1` FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_schedule_ibfk_2` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_schedule_ibfk_3` FOREIGN KEY (`lessonID`) REFERENCES `lesson` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Data exporting was unselected.
CREATE TABLE IF NOT EXISTS `lesson_by_schedule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `classID` INT NOT NULL,
  `scheduleID` INT NOT NULL,
  `startTime` TIME NOT NULL,
  `endTime` TIME NOT NULL,
  `date` DATE NOT NULL,
  `lessonID` INT DEFAULT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Dumping structure for table schooldb.student
CREATE TABLE IF NOT EXISTS `student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date DEFAULT NULL,
  `note` text,
  `isDelete` BOOLEAN DEFAULT FALSE;
  `scheduleID` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scheduleID` (`scheduleID`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.teacher
CREATE TABLE IF NOT EXISTS `teacher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date DEFAULT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.teachercommentonstudent
CREATE TABLE IF NOT EXISTS `teachercommentonstudent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacherID` int NOT NULL,
  `studentID` int NOT NULL,
  `comment` text NOT NULL,
  `scheduleID` int NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  KEY `teacherID` (`teacherID`),
  KEY `studentID` (`studentID`),
  KEY `scheduleID` (`scheduleID`),
  CONSTRAINT `teachercommentonstudent_ibfk_1` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachercommentonstudent_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachercommentonstudent_ibfk_3` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.teachertestcomment
CREATE TABLE IF NOT EXISTS `teachertestcomment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacherID` int NOT NULL,
  `studentID` int NOT NULL,
  `classID` int NOT NULL,
  `scheduleID` int NOT NULL,
  `skillComment` text NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  KEY `teacherID` (`teacherID`),
  KEY `studentID` (`studentID`),
  KEY `classID` (`classID`),
  KEY `scheduleID` (`scheduleID`),
  CONSTRAINT `teachertestcomment_ibfk_1` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachertestcomment_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachertestcomment_ibfk_3` FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachertestcomment_ibfk_4` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.testresult
CREATE TABLE IF NOT EXISTS `testresult` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentID` int NOT NULL,
  `testDate` date NOT NULL,
  `classID` int NOT NULL,
  `testTypeID` int NOT NULL,
  `assessmentsID` int NOT NULL,
  `listenScore` decimal(5,2) DEFAULT NULL,
  `speakingScore` decimal(5,2) DEFAULT NULL,
  `readingWritingScore` decimal(5,2) DEFAULT NULL,
  `averageScore` decimal(5,2) DEFAULT NULL,
  `teacherCommentID` int DEFAULT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  KEY `studentID` (`studentID`),
  KEY `classID` (`classID`),
  KEY `testTypeID` (`testTypeID`),
  KEY `assessmentsID` (`assessmentsID`),
  KEY `teacherCommentID` (`teacherCommentID`),
  CONSTRAINT `testresult_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `testresult_ibfk_2` FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `testresult_ibfk_3` FOREIGN KEY (`testTypeID`) REFERENCES `testtype` (`id`) ON DELETE CASCADE,
  CONSTRAINT `testresult_ibfk_4` FOREIGN KEY (`assessmentsID`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `testresult_ibfk_5` FOREIGN KEY (`teacherCommentID`) REFERENCES `teachertestcomment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.testtype
CREATE TABLE IF NOT EXISTS `testtype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table schooldb.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isDelete` BOOLEAN DEFAULT FALSE;
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
