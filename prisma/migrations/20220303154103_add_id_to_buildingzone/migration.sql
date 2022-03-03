/*
  Warnings:

  - The primary key for the `BuildingZone` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BuildingZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitatId" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "placement" TEXT NOT NULL,
    CONSTRAINT "BuildingZone_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingZone_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingZone" ("buildingId", "habitatId", "level", "placement") SELECT "buildingId", "habitatId", "level", "placement" FROM "BuildingZone";
DROP TABLE "BuildingZone";
ALTER TABLE "new_BuildingZone" RENAME TO "BuildingZone";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
