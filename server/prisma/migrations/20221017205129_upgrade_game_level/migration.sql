/*
  Warnings:

  - Added the required column `TargetScore` to the `GameLevel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TimerSeconds` to the `GameLevel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "TimerSeconds" INTEGER NOT NULL,
    "TargetScore" INTEGER NOT NULL
);
INSERT INTO "new_GameLevel" ("id", "name") SELECT "id", "name" FROM "GameLevel";
DROP TABLE "GameLevel";
ALTER TABLE "new_GameLevel" RENAME TO "GameLevel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
