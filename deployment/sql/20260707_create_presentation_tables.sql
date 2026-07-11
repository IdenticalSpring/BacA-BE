-- Presentation/PPTist integration tables for HappyClass.
-- Safe to run more than once. This script only creates new tables when missing.
-- Run manually on production before restarting the backend with the PresentationModule enabled.
CREATE TABLE IF NOT EXISTS `presentations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `lessonId` int NULL,
  `lessonByScheduleId` int NULL,
  `ownerRole` varchar(20) NOT NULL DEFAULT 'teacher',
  `ownerId` int NULL,
  `contentJson` longtext NULL,
  `metadataJson` longtext NULL,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `language` varchar(20) NOT NULL DEFAULT 'vi',
  `thumbnailUrl` text NULL,
  `isDeleted` tinyint NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_presentations_lessonId` (`lessonId`),
  KEY `idx_presentations_lessonByScheduleId` (`lessonByScheduleId`),
  KEY `idx_presentations_owner` (`ownerRole`, `ownerId`),
  KEY `idx_presentations_deleted_updated` (`isDeleted`, `updatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `presentation_assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `presentationId` int NOT NULL,
  `assetType` varchar(30) NOT NULL DEFAULT 'image',
  `url` text NOT NULL,
  `originalName` text NULL,
  `mimeType` varchar(120) NULL,
  `size` int NULL,
  `metadataJson` longtext NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_presentation_assets_presentationId` (`presentationId`),
  KEY `idx_presentation_assets_type` (`assetType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `presentation_shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `presentationId` int NOT NULL,
  `token` varchar(96) NOT NULL,
  `permission` varchar(20) NOT NULL DEFAULT 'read',
  `canDownload` tinyint NOT NULL DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `expiresAt` datetime NULL,
  `createdById` int NULL,
  `createdByRole` varchar(20) NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_presentation_shares_token` (`token`),
  KEY `idx_presentation_shares_presentationId` (`presentationId`),
  KEY `idx_presentation_shares_active` (`isActive`, `expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ppt_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'custom',
  `isSystem` tinyint NOT NULL DEFAULT 0,
  `isDeleted` tinyint NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ppt_tags_slug` (`slug`),
  KEY `idx_ppt_tags_category_name` (`category`, `name`),
  KEY `idx_ppt_tags_deleted` (`isDeleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `presentation_tags` (
  `presentationId` int NOT NULL,
  `tagId` int NOT NULL,
  PRIMARY KEY (`presentationId`, `tagId`),
  KEY `idx_presentation_tags_tagId` (`tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;