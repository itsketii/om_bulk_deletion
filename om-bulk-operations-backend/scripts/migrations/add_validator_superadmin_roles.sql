-- Reference migration for environments that do not rely on
-- sequelize.sync({ alter: true }). Run once against the target
-- MySQL database to add the SUPERADMIN/VALIDATOR roles and
-- the upload validation workflow columns.

ALTER TABLE `users`
    MODIFY COLUMN `role`
        ENUM('SUPERADMIN', 'ADMIN', 'VALIDATOR', 'USER')
        NOT NULL DEFAULT 'USER';

ALTER TABLE `uploads`
    ADD COLUMN `validation_status`
        ENUM('PENDING_VALIDATION', 'VALIDATED', 'REJECTED')
        NULL DEFAULT 'PENDING_VALIDATION' AFTER `status`,
    ADD COLUMN `validated_by` BIGINT NULL AFTER `validation_status`,
    ADD COLUMN `validated_at` DATETIME NULL AFTER `validated_by`,
    ADD COLUMN `validation_comment` TEXT NULL AFTER `validated_at`;

-- Optional: backfill historical uploads as already validated so
-- existing flows keep working without manual intervention.
UPDATE `uploads`
   SET `validation_status` = 'VALIDATED'
 WHERE `validation_status` IS NULL;
