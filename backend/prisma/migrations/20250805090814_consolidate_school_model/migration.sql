/*
  Warnings:

  - You are about to drop the `schools` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Student_payment_pending` DROP FOREIGN KEY `Student_payment_pending_ibfk_2`;

-- DropForeignKey
ALTER TABLE `academic_year` DROP FOREIGN KEY `academic_year_ibfk_1`;

-- DropForeignKey
ALTER TABLE `admins` DROP FOREIGN KEY `admins_ibfk_1`;

-- DropForeignKey
ALTER TABLE `bannerImages` DROP FOREIGN KEY `bannerImages_ibfk_1`;

-- DropForeignKey
ALTER TABLE `classrooms` DROP FOREIGN KEY `classrooms_ibfk_1`;

-- DropForeignKey
ALTER TABLE `exam_marks` DROP FOREIGN KEY `exam_marks_ibfk_1`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_ibfk_2`;

-- DropForeignKey
ALTER TABLE `fee_categories` DROP FOREIGN KEY `fee_categories_ibfk_1`;

-- DropForeignKey
ALTER TABLE `gallery` DROP FOREIGN KEY `gallery_ibfk_1`;

-- DropForeignKey
ALTER TABLE `homeworks` DROP FOREIGN KEY `homeworks_ibfk_1`;

-- DropForeignKey
ALTER TABLE `messageBoards` DROP FOREIGN KEY `messageBoards_ibfk_3`;

-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_ibfk_1`;

-- DropForeignKey
ALTER TABLE `school_financials` DROP FOREIGN KEY `school_financials_ibfk_2`;

-- DropForeignKey
ALTER TABLE `studentAttendance` DROP FOREIGN KEY `studentAttendance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `student_fees` DROP FOREIGN KEY `student_fees_ibfk_1`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_2`;

-- DropForeignKey
ALTER TABLE `students_payments` DROP FOREIGN KEY `students_payments_ibfk_1`;

-- DropForeignKey
ALTER TABLE `subjects` DROP FOREIGN KEY `subjects_ibfk_1`;

-- DropForeignKey
ALTER TABLE `teacherAttendance` DROP FOREIGN KEY `teacherAttendance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `teachers` DROP FOREIGN KEY `teachers_ibfk_3`;

-- DropForeignKey
ALTER TABLE `youtudeVideo` DROP FOREIGN KEY `youtudeVideo_ibfk_1`;

-- DropTable
DROP TABLE `schools`;

-- CreateTable
CREATE TABLE `school` (
    `school_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(15) NULL,
    `email` VARCHAR(100) NULL,
    `school_code` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `school_school_code_key`(`school_code`),
    PRIMARY KEY (`school_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `academic_year` ADD CONSTRAINT `academic_year_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bannerImages` ADD CONSTRAINT `bannerImages_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fee_categories` ADD CONSTRAINT `fee_categories_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `gallery` ADD CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messageBoards` ADD CONSTRAINT `messageBoards_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `school_financials` ADD CONSTRAINT `school_financials_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `studentAttendance` ADD CONSTRAINT `studentAttendance_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_payments` ADD CONSTRAINT `students_payments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teacherAttendance` ADD CONSTRAINT `teacherAttendance_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `youtudeVideo` ADD CONSTRAINT `youtudeVideo_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
