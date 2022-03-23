-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BuildingZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitatId" INTEGER NOT NULL,
    "buildingId" INTEGER,
    "level" INTEGER NOT NULL DEFAULT 0,
    "placement" TEXT,
    "counterPerHabitat" INTEGER NOT NULL,
    CONSTRAINT "BuildingZone_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingZone_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BuildingZone" ("buildingId", "counterPerHabitat", "habitatId", "id", "level", "placement") SELECT "buildingId", "counterPerHabitat", "habitatId", "id", "level", "placement" FROM "BuildingZone";
DROP TABLE "BuildingZone";
ALTER TABLE "new_BuildingZone" RENAME TO "BuildingZone";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
