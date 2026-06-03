-- Reference migration for environments that do not rely on
-- sequelize.sync(). Run once against the target MySQL database.

CREATE TABLE IF NOT EXISTS `bulk_executions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `upload_id` BIGINT NOT NULL,
    `triggered_by` BIGINT NULL,
    `currency` ENUM('CDF', 'USD') NOT NULL,
    `input_file` VARCHAR(500) NOT NULL,
    `log_file` VARCHAR(500) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
        NOT NULL DEFAULT 'PENDING',
    `pid` INT NULL,
    `error_message` TEXT NULL,
    `started_at` DATETIME NULL,
    `completed_at` DATETIME NULL,
    `last_log_update` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_bulk_executions_upload_id` (`upload_id`),
    KEY `idx_bulk_executions_status` (`status`),
    KEY `idx_bulk_executions_triggered_by` (`triggered_by`),
    CONSTRAINT `fk_bulk_executions_upload`
        FOREIGN KEY (`upload_id`)
        REFERENCES `uploads` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_bulk_executions_user`
        FOREIGN KEY (`triggered_by`)
        REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
