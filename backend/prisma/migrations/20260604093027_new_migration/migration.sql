-- AlterTable
ALTER TABLE `fee_categories` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `email` VARCHAR(100) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `name` VARCHAR(100) NULL,
    ADD COLUMN `password` VARCHAR(255) NULL,
    ADD COLUMN `school_id` INTEGER NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `email` ON `users`(`email`);

-- CreateIndex
CREATE INDEX `user_school_id` ON `users`(`school_id`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE NO ACTION ON UPDATE CASCADE;
