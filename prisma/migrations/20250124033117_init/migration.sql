-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publishedDate" DATETIME NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "amazonLink" TEXT NOT NULL
);
