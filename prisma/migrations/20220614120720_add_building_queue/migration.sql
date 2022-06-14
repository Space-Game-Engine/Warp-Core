/*
  Warnings:

  - You are about to drop the column `endOfBuildingUpgrade` on the `BuildingZone` table. All the data in the column will be lost.
  - You are about to drop the column `startOfBuildingUpgrade` on the `BuildingZone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `BuildingZone` DROP COLUMN `endOfBuildingUpgrade`,
DROP
COLUMN `startOfBuildingUpgrade`;

-- CreateTable
CREATE TABLE `BuildingQueueElement`
(
    `id`             INTEGER NOT NULL AUTO_INCREMENT,
    `startLevel`     INTEGER NOT NULL,
    `endLevel`       INTEGER NOT NULL,
    `startTime`      DATETIME(3) NOT NULL,
    `endTime`        DATETIME(3) NOT NULL,
    `buildingId`     INTEGER NOT NULL,
    `buildingZoneId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BuildingQueueElement`
    ADD CONSTRAINT `BuildingQueueElement_buildingId_fkey` FOREIGN KEY (`buildingId`) REFERENCES `Building` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildingQueueElement`
    ADD CONSTRAINT `BuildingQueueElement_buildingZoneId_fkey` FOREIGN KEY (`buildingZoneId`) REFERENCES `BuildingZone` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
