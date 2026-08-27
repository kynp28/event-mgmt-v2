-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `cancel_reason` VARCHAR(50) NULL,
    ADD COLUMN `payment_deadline` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `booths` ADD COLUMN `lock_state` ENUM('none', 'payment_pending', 'waitlist_reserved') NOT NULL DEFAULT 'none',
    ADD COLUMN `locked_at` DATETIME(3) NULL,
    ADD COLUMN `locked_by_user_id` INTEGER NULL,
    ADD COLUMN `locked_until` DATETIME(3) NULL,
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `events` ADD COLUMN `description` TEXT NULL;

-- AlterTable
ALTER TABLE `waitlist` ADD COLUMN `cancel_reason` VARCHAR(50) NULL,
    ADD COLUMN `offer_deadline` DATETIME(3) NULL,
    ADD COLUMN `offered_at` DATETIME(3) NULL,
    ADD COLUMN `queue_position` INTEGER NOT NULL DEFAULT 0;
