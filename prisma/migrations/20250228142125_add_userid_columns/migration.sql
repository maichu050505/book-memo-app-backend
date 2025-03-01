/*
  Warnings:

  - You are about to drop the column `status` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `Bookshelf` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Bookshelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Memo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BooksBookshelf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "bookshelfId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WANT_TO_READ',
    CONSTRAINT "BooksBookshelf_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BooksBookshelf_bookshelfId_fkey" FOREIGN KEY ("bookshelfId") REFERENCES "Bookshelf" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "amazonLink" TEXT NOT NULL
);
INSERT INTO "new_Book" ("amazonLink", "author", "coverImageUrl", "id", "publishedDate", "publisher", "title") SELECT "amazonLink", "author", "coverImageUrl", "id", "publishedDate", "publisher", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE TABLE "new_Bookshelf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Bookshelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bookshelf" ("id") SELECT "id" FROM "Bookshelf";
DROP TABLE "Bookshelf";
ALTER TABLE "new_Bookshelf" RENAME TO "Bookshelf";
CREATE UNIQUE INDEX "Bookshelf_userId_key" ON "Bookshelf"("userId");
CREATE TABLE "new_Memo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "memoText" TEXT NOT NULL,
    "memoImg" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Memo_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Memo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Memo" ("bookId", "createdAt", "id", "memoImg", "memoText", "updatedAt") SELECT "bookId", "createdAt", "id", "memoImg", "memoText", "updatedAt" FROM "Memo";
DROP TABLE "Memo";
ALTER TABLE "new_Memo" RENAME TO "Memo";
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reviewText" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("bookId", "date", "id", "rating", "reviewText") SELECT "bookId", "date", "id", "rating", "reviewText" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
