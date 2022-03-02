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
CREATE TABLE "BuildingZone" (
    "habitatId" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "placement" TEXT NOT NULL,

    PRIMARY KEY ("habitatId", "buildingId"),
    CONSTRAINT "BuildingZone_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingZone_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BuildingCosts" (
    "buildingId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,

    PRIMARY KEY ("buildingId", "resourceId"),
    CONSTRAINT "BuildingCosts_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingCosts_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceAmount" (
    "habitatId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,

    PRIMARY KEY ("habitatId", "resourceId"),
    CONSTRAINT "ResourceAmount_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResourceAmount_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
