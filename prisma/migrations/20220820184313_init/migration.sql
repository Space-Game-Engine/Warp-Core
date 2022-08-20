-- CreateTable
CREATE TABLE "Habitat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Building" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BuildingDetailsAtCertainLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buildingId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "timeToUpdateBuildingInSeconds" INTEGER NOT NULL,
    CONSTRAINT "BuildingDetailsAtCertainLevel_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildingZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitatId" INTEGER NOT NULL,
    "buildingId" INTEGER,
    "level" INTEGER NOT NULL DEFAULT 0,
    "placement" TEXT,
    "counterPerHabitat" INTEGER NOT NULL,
    CONSTRAINT "BuildingZone_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingZone_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildingQueueElement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startLevel" INTEGER NOT NULL,
    "endLevel" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "buildingZoneId" INTEGER NOT NULL,
    CONSTRAINT "BuildingQueueElement_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingQueueElement_buildingZoneId_fkey" FOREIGN KEY ("buildingZoneId") REFERENCES "BuildingZone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ResourceAmount" (
    "habitatId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,

    PRIMARY KEY ("habitatId", "resourceId"),
    CONSTRAINT "ResourceAmount_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResourceAmount_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
