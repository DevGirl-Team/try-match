-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordSalt" TEXT,
    "passwordHash" TEXT NOT NULL,
    "sessionToken" TEXT,
    "bio" TEXT
);
INSERT INTO "new_User" ("bio", "email", "id", "name", "passwordHash", "passwordSalt", "sessionToken") SELECT "bio", "email", "id", "name", "passwordHash", "passwordSalt", "sessionToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
