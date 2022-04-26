-- CreateTable
CREATE TABLE `Habitat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Building` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuildingDetailsAtCertainLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buildingId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `timeToUpdateBuildingInSeconds` INTEGER NOT NULL,
    `requirements` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuildingZone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `habitatId` INTEGER NOT NULL,
    `buildingId` INTEGER NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `placement` VARCHAR(191) NULL,
    `counterPerHabitat` INTEGER NOT NULL,
    `startOfBuildingUpgrade` DATETIME(3) NOT NULL,
    `endOfBuildingUpgrade` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResourceAmount` (
    `habitatId` INTEGER NOT NULL,
    `resourceId` INTEGER NOT NULL,

    PRIMARY KEY (`habitatId`, `resourceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BuildingDetailsAtCertainLevel` ADD CONSTRAINT `BuildingDetailsAtCertainLevel_buildingId_fkey` FOREIGN KEY (`buildingId`) REFERENCES `Building`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildingZone` ADD CONSTRAINT `BuildingZone_habitatId_fkey` FOREIGN KEY (`habitatId`) REFERENCES `Habitat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildingZone` ADD CONSTRAINT `BuildingZone_buildingId_fkey` FOREIGN KEY (`buildingId`) REFERENCES `Building`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAmount` ADD CONSTRAINT `ResourceAmount_habitatId_fkey` FOREIGN KEY (`habitatId`) REFERENCES `Habitat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAmount` ADD CONSTRAINT `ResourceAmount_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `Resource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
