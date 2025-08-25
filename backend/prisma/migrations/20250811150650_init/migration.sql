/*
  Warnings:

  - You are about to drop the `youtudevideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `youtudevideo` DROP FOREIGN KEY `youtudeVideo_ibfk_1`;

-- AlterTable
ALTER TABLE `schoolfinancials` MODIFY `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- DropTable
DROP TABLE `youtudevideo`;

-- CreateTable
CREATE TABLE `youtubeVideo` (
    `youtube_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_name` VARCHAR(20) NOT NULL,
    `youtubeLink` VARCHAR(225) NOT NULL,
    `school_id` INTEGER NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`youtube_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `admin_email` ON `admins`(`admin_email`);

-- AddForeignKey
ALTER TABLE `youtubeVideo` ADD CONSTRAINT `youtubeVideo_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
