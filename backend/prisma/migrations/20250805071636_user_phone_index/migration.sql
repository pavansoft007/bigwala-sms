-- CreateTable
CREATE TABLE `SequelizeMeta` (
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student_payment_pending` (
    `pending_payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `payment_photo` TEXT NOT NULL,
    `status` ENUM('rejected', 'approved', 'pending') NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `category_id`(`category_id`),
    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`pending_payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_year` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(255) NOT NULL,
    `school_id` INTEGER NOT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER NOT NULL,
    `admin_name` VARCHAR(100) NOT NULL,
    `admin_email` VARCHAR(100) NOT NULL,
    `admin_phone_number` VARCHAR(15) NOT NULL,
    `admin_password` VARCHAR(100) NOT NULL,
    `role_id` INTEGER NOT NULL,

    INDEX `role_id`(`role_id`),
    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bannerImages` (
    `banner_id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `school_id` INTEGER NOT NULL,
    `uploadedOn` DATETIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`banner_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classrooms` (
    `classroom_id` INTEGER NOT NULL AUTO_INCREMENT,
    `standard` VARCHAR(50) NOT NULL,
    `section` VARCHAR(10) NOT NULL,
    `school_id` INTEGER NOT NULL,
    `addedDate` TIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`classroom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_marks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `exam_id` INTEGER NOT NULL,
    `marks` INTEGER NOT NULL,

    INDEX `class_id`(`class_id`),
    INDEX `exam_id`(`exam_id`),
    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    INDEX `subject_id`(`subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `exam_id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_name` VARCHAR(225) NOT NULL,
    `class_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `addedOn` DATETIME(0) NOT NULL,
    `start_date` DATETIME(0) NOT NULL,
    `timetable_photo` VARCHAR(200) NOT NULL,
    `end_date` DATETIME(0) NOT NULL,
    `status` ENUM('scheduled', 'ongoing', 'completed', 'postponed') NOT NULL,

    INDEX `class_id`(`class_id`),
    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`exam_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_categories` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER NOT NULL,
    `category_name` VARCHAR(225) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery` (
    `gallery_id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `event_name` VARCHAR(20) NOT NULL,
    `school_id` INTEGER NOT NULL,
    `uploadedOn` DATETIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`gallery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homeworks` (
    `homework_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER NOT NULL,
    `classroom_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `context` TEXT NOT NULL,
    `addedDate` DATE NOT NULL,

    INDEX `classroom_id`(`classroom_id`),
    INDEX `school_id`(`school_id`),
    INDEX `subject_id`(`subject_id`),
    PRIMARY KEY (`homework_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interested_schools` (
    `school_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_name` VARCHAR(225) NOT NULL,
    `location` VARCHAR(225) NOT NULL,
    `status` ENUM('fresh', 'contacted-no-response', 'contacted-awaiting-response', 'closed') NOT NULL,
    `admin_name` VARCHAR(225) NOT NULL,
    `phone_number` VARCHAR(13) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`school_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messageBoards` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NULL,
    `classroom_id` INTEGER NULL,
    `message_type` ENUM('text', 'voice') NOT NULL,
    `text_message` TEXT NULL,
    `voice_location` VARCHAR(225) NULL,
    `school_id` INTEGER NOT NULL,
    `added_by` ENUM('teacher', 'admin') NOT NULL,
    `added_member_id` INTEGER NULL,
    `added_on` DATETIME(0) NOT NULL,
    `type` ENUM('completeSchool', 'completeClass', 'student') NOT NULL,

    INDEX `classroom_id`(`classroom_id`),
    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module_name` VARCHAR(225) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(225) NOT NULL,
    `school_id` INTEGER NOT NULL,
    `permissions` JSON NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_financials` (
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

-- CreateTable
CREATE TABLE `schools` (
    `school_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(15) NULL,
    `email` VARCHAR(100) NULL,
    `school_code` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`school_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentAttendance` (
    `attendance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `attendDate` DATE NOT NULL,
    `attendTime` TIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`attendance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_fees` (
    `fee_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee_amount` INTEGER NOT NULL,
    `total_fee_paid` INTEGER NOT NULL,
    `fee_remaining` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `classroom_id` INTEGER NOT NULL,
    `created_by` VARCHAR(255) NOT NULL,
    `teacher_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `admin_id`(`admin_id`),
    INDEX `category_id`(`category_id`),
    INDEX `classroom_id`(`classroom_id`),
    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`fee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `student_id` INTEGER NOT NULL AUTO_INCREMENT,
    `admission_ID` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `student_photo` VARCHAR(255) NULL,
    `father_photo` VARCHAR(255) NULL,
    `phone_number` VARCHAR(15) NOT NULL,
    `address` VARCHAR(255) NULL,
    `enrollment_date` DATE NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `mother_name` VARCHAR(225) NOT NULL,
    `father_name` VARCHAR(225) NOT NULL,
    `mother_phone_number` VARCHAR(20) NOT NULL,
    `caste` ENUM('OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST') NOT NULL,
    `sub_caste` VARCHAR(225) NOT NULL,
    `assignedClassroom` INTEGER NULL,
    `school_code` VARCHAR(20) NOT NULL,
    `school_id` INTEGER NOT NULL,

    UNIQUE INDEX `admission_ID`(`admission_ID`),
    INDEX `assignedClassroom`(`assignedClassroom`),
    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students_payments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `payment_mode` ENUM('cash', 'online', 'upi') NOT NULL,
    `collected_by` INTEGER NULL,
    `payment_date` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `category_id`(`category_id`),
    INDEX `collected_by`(`collected_by`),
    INDEX `school_id`(`school_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_name` VARCHAR(225) NOT NULL,
    `subject_code` VARCHAR(10) NOT NULL,
    `school_id` INTEGER NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacherAttendance` (
    `attendance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `attendDate` DATE NOT NULL,
    `attendTime` TIME(0) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submitted_at` DATETIME(0) NOT NULL,

    INDEX `school_id`(`school_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`attendance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `TeacherID` VARCHAR(20) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,
    `hire_date` DATE NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL,
    `adminAccess` BOOLEAN NOT NULL,
    `school_code` VARCHAR(10) NOT NULL,
    `salary` INTEGER NOT NULL,
    `assignedClass` INTEGER NULL,
    `school_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `teachers_qualification` VARCHAR(255) NULL,
    `teacher_photo` VARCHAR(255) NULL,
    `teacher_qualification_certificate` VARCHAR(255) NULL,

    UNIQUE INDEX `TeacherID`(`TeacherID`),
    UNIQUE INDEX `assignedClass`(`assignedClass`),
    INDEX `role_id`(`role_id`),
    INDEX `school_id`(`school_id`),
    INDEX `subject_id`(`subject_id`),
    PRIMARY KEY (`teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone_number` VARCHAR(15) NOT NULL,
    `role` ENUM('student', 'teacher', 'admin', 'admin-teacher') NOT NULL,
    `original_id` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `phone_number`(`phone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `youtudeVideo` (
    `youtude_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_name` VARCHAR(20) NOT NULL,
    `youtudeLink` VARCHAR(225) NOT NULL,
    `school_id` INTEGER NOT NULL,

    INDEX `school_id`(`school_id`),
    PRIMARY KEY (`youtude_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Student_payment_pending` ADD CONSTRAINT `Student_payment_pending_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `academic_year` ADD CONSTRAINT `academic_year_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bannerImages` ADD CONSTRAINT `bannerImages_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_marks` ADD CONSTRAINT `exam_marks_ibfk_5` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fee_categories` ADD CONSTRAINT `fee_categories_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `gallery` ADD CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_2` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `messageBoards` ADD CONSTRAINT `messageBoards_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messageBoards` ADD CONSTRAINT `messageBoards_ibfk_2` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messageBoards` ADD CONSTRAINT `messageBoards_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `school_financials` ADD CONSTRAINT `school_financials_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `academic_year`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `school_financials` ADD CONSTRAINT `school_financials_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `studentAttendance` ADD CONSTRAINT `studentAttendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `studentAttendance` ADD CONSTRAINT `studentAttendance_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_4` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_5` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_ibfk_6` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`admin_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`assignedClassroom`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_payments` ADD CONSTRAINT `students_payments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_payments` ADD CONSTRAINT `students_payments_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_payments` ADD CONSTRAINT `students_payments_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_payments` ADD CONSTRAINT `students_payments_ibfk_4` FOREIGN KEY (`collected_by`) REFERENCES `admins`(`admin_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teacherAttendance` ADD CONSTRAINT `teacherAttendance_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teacherAttendance` ADD CONSTRAINT `teacherAttendance_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`assignedClass`) REFERENCES `classrooms`(`classroom_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_ibfk_4` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `youtudeVideo` ADD CONSTRAINT `youtudeVideo_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
