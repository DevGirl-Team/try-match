-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discussion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);
INSERT INTO "new_Discussion" ("id", "name") SELECT "id", "name" FROM "Discussion";
DROP TABLE "Discussion";
ALTER TABLE "new_Discussion" RENAME TO "Discussion";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
