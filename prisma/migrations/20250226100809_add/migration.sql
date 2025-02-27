-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publishedDate" DATETIME NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "amazonLink" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WANT_TO_READ'
);
INSERT INTO "new_Book" ("amazonLink", "author", "coverImageUrl", "id", "publishedDate", "publisher", "title") SELECT "amazonLink", "author", "coverImageUrl", "id", "publishedDate", "publisher", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
