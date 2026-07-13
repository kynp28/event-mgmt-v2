-- AlterTable
ALTER TABLE `events` ADD COLUMN `image_url` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `slip_image` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `waitlist` (
    `waitlist_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_id` INTEGER NOT NULL,
    `event_id` INTEGER NOT NULL,
    `booth_id` INTEGER NOT NULL,
    `status` ENUM('waiting', 'allocated', 'cancelled') NOT NULL DEFAULT 'waiting',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `waitlist_vendor_id_idx`(`vendor_id`),
    INDEX `waitlist_event_id_idx`(`event_id`),
    INDEX `waitlist_booth_id_idx`(`booth_id`),
    INDEX `waitlist_status_idx`(`status`),
    PRIMARY KEY (`waitlist_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `waitlist` ADD CONSTRAINT `waitlist_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waitlist` ADD CONSTRAINT `waitlist_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waitlist` ADD CONSTRAINT `waitlist_booth_id_fkey` FOREIGN KEY (`booth_id`) REFERENCES `booths`(`booth_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
