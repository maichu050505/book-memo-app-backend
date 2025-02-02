-- CreateTable
CREATE TABLE "Bookshelf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" INTEGER NOT NULL,
    CONSTRAINT "Bookshelf_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookshelf_bookId_key" ON "Bookshelf"("bookId");
