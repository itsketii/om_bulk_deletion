-- Notifications table for in-app alerts (e.g. upload validated/rejected).

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` ENUM('UPLOAD_VALIDATED', 'UPLOAD_REJECTED') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NULL,
    `upload_id` BIGINT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_user_unread` (`user_id`, `is_read`),
    KEY `idx_notifications_upload_id` (`upload_id`),
    CONSTRAINT `fk_notifications_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_upload`
        FOREIGN KEY (`upload_id`)
        REFERENCES `uploads` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
