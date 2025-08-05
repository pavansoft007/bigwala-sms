/*
  Warnings:

  - You are about to drop the `school_financials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `school_financials` DROP FOREIGN KEY `school_financials_ibfk_1`;

-- DropForeignKey
ALTER TABLE `school_financials` DROP FOREIGN KEY `school_financials_ibfk_2`;

-- DropTable
DROP TABLE `school_financials`;

-- CreateTable
CREATE TABLE `schoolFinancials` (
    `school_financial_id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(255) NOT NULL,
    `year_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `current_balance` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    INDEX `year_id`(`year_id`),
    PRIMARY KEY (`school_financial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schoolFinancials` ADD CONSTRAINT `school_financials_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `academic_year`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `schoolFinancials` ADD CONSTRAINT `school_financials_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
