/*
  Warnings:

  - You are about to drop the column `darkBackgroundColor` on the `systemsettings` table. All the data in the column will be lost.
  - You are about to drop the column `darkBorderColor` on the `systemsettings` table. All the data in the column will be lost.
  - You are about to drop the column `darkSurfaceColor` on the `systemsettings` table. All the data in the column will be lost.
  - You are about to drop the column `lightBackgroundColor` on the `systemsettings` table. All the data in the column will be lost.
  - You are about to drop the column `lightBorderColor` on the `systemsettings` table. All the data in the column will be lost.
  - You are about to drop the column `lightSurfaceColor` on the `systemsettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `systemsettings` DROP COLUMN `darkBackgroundColor`,
    DROP COLUMN `darkBorderColor`,
    DROP COLUMN `darkSurfaceColor`,
    DROP COLUMN `lightBackgroundColor`,
    DROP COLUMN `lightBorderColor`,
    DROP COLUMN `lightSurfaceColor`;
