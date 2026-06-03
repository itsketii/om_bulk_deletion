-- Reference migration for environments that do not rely on
-- sequelize.sync({ alter: true }). Run once against the target
-- MySQL database to add the `fullname` column to `users`.

ALTER TABLE `users`
    ADD COLUMN `fullname` VARCHAR(150) NULL AFTER `username`;
