/*
  Warnings:

  - You are about to alter the column `addedDate` on the `classrooms` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(0)`.
  - Added the required column `updated_on` to the `messageBoards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Student_payment_pending` DROP FOREIGN KEY `Student_payment_pending_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Student_payment_pending` DROP FOREIGN KEY `Student_payment_pending_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Student_payment_pending` DROP FOREIGN KEY `Student_payment_pending_ibfk_3`;

-- DropForeignKey
ALTER TABLE `academic_year` DROP FOREIGN KEY `academic_year_ibfk_1`;

-- DropForeignKey
ALTER TABLE `admins` DROP FOREIGN KEY `admins_ibfk_1`;

-- DropForeignKey
ALTER TABLE `admins` DROP FOREIGN KEY `admins_ibfk_2`;

-- DropForeignKey
ALTER TABLE `bannerImages` DROP FOREIGN KEY `bannerImages_ibfk_1`;

-- DropForeignKey
ALTER TABLE `classrooms` DROP FOREIGN KEY `classrooms_ibfk_1`;

-- DropIndex
DROP INDEX `name` ON `SequelizeMeta`;

-- AlterTable
ALTER TABLE `classrooms` MODIFY `addedDate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `exams` MODIFY `addedOn` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `start_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `fee_categories` MODIFY `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `gallery` MODIFY `uploadedOn` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `interested_schools` MODIFY `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `messageBoards` ADD COLUMN `updated_on` DATETIME(3) NOT NULL,
    MODIFY `added_on` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `student_fees` MODIFY `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `students_payments` MODIFY `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `teacherAttendance` MODIFY `submitted_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `teacher_leaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `leave_type` ENUM('sick', 'casual', 'emergency', 'maternity', 'paternity', 'annual', 'compensatory', 'other') NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `is_half_day` BOOLEAN NOT NULL DEFAULT false,
    `half_day_period` ENUM('morning', 'afternoon') NULL,
    `year_id` INTEGER NOT NULL,
    `attachment_url` VARCHAR(191) NULL,
    `emergency_contact` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `teacher_leaves_teacher_id_idx`(`teacher_id`),
    INDEX `teacher_leaves_school_id_idx`(`school_id`),
    INDEX `teacher_leaves_year_id_idx`(`year_id`),
    INDEX `teacher_leaves_approved_by_idx`(`approved_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_year` ADD CONSTRAINT `academic_year_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bannerImages` ADD CONSTRAINT `bannerImages_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_leaves` ADD CONSTRAINT `teacher_leaves_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_leaves` ADD CONSTRAINT `teacher_leaves_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_leaves` ADD CONSTRAINT `teacher_leaves_year_id_fkey` FOREIGN KEY (`year_id`) REFERENCES `academic_year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_leaves` ADD CONSTRAINT `teacher_leaves_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `admins`(`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Student_payment_pending` RENAME INDEX `category_id` TO `Student_payment_pending_category_id_idx`;

-- RenameIndex
ALTER TABLE `Student_payment_pending` RENAME INDEX `school_id` TO `Student_payment_pending_school_id_idx`;

-- RenameIndex
ALTER TABLE `Student_payment_pending` RENAME INDEX `student_id` TO `Student_payment_pending_student_id_idx`;

-- RenameIndex
ALTER TABLE `academic_year` RENAME INDEX `school_id` TO `academic_year_school_id_idx`;

-- RenameIndex
ALTER TABLE `admins` RENAME INDEX `admin_email` TO `admins_admin_email_idx`;

-- RenameIndex
ALTER TABLE `admins` RENAME INDEX `role_id` TO `admins_role_id_idx`;

-- RenameIndex
ALTER TABLE `admins` RENAME INDEX `school_id` TO `admins_school_id_idx`;

-- RenameIndex
ALTER TABLE `bannerImages` RENAME INDEX `school_id` TO `bannerImages_school_id_idx`;

-- RenameIndex
ALTER TABLE `classrooms` RENAME INDEX `school_id` TO `classrooms_school_id_idx`;
