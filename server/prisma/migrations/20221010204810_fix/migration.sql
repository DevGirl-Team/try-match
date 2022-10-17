/*
  Warnings:

  - Added the required column `hadLiked` to the `UserRelation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hadLiked" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "relationId" INTEGER NOT NULL,
    CONSTRAINT "UserRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRelation_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "Relation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserRelation" ("id", "relationId", "userId") SELECT "id", "relationId", "userId" FROM "UserRelation";
DROP TABLE "UserRelation";
ALTER TABLE "new_UserRelation" RENAME TO "UserRelation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
