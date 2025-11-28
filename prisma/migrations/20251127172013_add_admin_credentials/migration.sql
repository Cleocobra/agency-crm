-- AlterTable
ALTER TABLE `systemsettings` ADD COLUMN `adminPassword` VARCHAR(191) NOT NULL DEFAULT '123',
    ADD COLUMN `adminUsername` VARCHAR(191) NOT NULL DEFAULT 'admin';
