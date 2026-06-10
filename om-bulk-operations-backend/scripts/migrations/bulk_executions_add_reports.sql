-- Reference migration for environments that do not rely on
-- sequelize.sync({ alter: true }). Run once against the target
-- MySQL database to add the report columns to `bulk_executions`.

ALTER TABLE `bulk_executions`
    ADD COLUMN `success_file` VARCHAR(500) NULL AFTER `last_log_update`,
    ADD COLUMN `failed_file`  VARCHAR(500) NULL AFTER `success_file`,
    ADD COLUMN `success_count` INT NULL DEFAULT 0 AFTER `failed_file`,
    ADD COLUMN `failed_count`  INT NULL DEFAULT 0 AFTER `success_count`;
