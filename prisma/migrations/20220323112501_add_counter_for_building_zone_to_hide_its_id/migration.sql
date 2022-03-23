/*
  Warnings:

  - Added the required column `counterPerHabitat` to the `BuildingZone` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BuildingZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitatId" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "placement" TEXT NOT NULL,
    "counterPerHabitat" INTEGER NOT NULL,
    CONSTRAINT "BuildingZone_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingZone_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingZone" ("buildingId", "habitatId", "id", "level", "placement") SELECT "buildingId", "habitatId", "id", "level", "placement" FROM "BuildingZone";
DROP TABLE "BuildingZone";
ALTER TABLE "new_BuildingZone" RENAME TO "BuildingZone";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
