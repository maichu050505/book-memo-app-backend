const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 本棚から削除するエンドポイント (DELETE /users/:userId/bookshelf/:bookId)
router.delete("/users/:userId/bookshelf/:bookId", authMiddleware, async (req, res) => {
  const { userId, bookId } = req.params;
  if (!bookId) {
    return res.status(400).json({ error: "bookIdが指定されていません" });
  }

  try {
    // BooksBookshelf モデルから対象の書籍登録レコードを取得
    const record = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(bookId),
        bookshelf: { userId: Number(userId) },
      },
    });
    if (!record) {
      return res.status(404).json({ error: "本棚に登録されていません。" });
    }

    // BooksBookshelf テーブルから該当レコードを削除する
    await prisma.booksBookshelf.delete({
      where: { id: record.id },
    });

    res.status(200).json({ message: "本棚から削除しました" });
  } catch (error) {
    console.error("削除エラー:", error);
    res.status(500).json({ error: "本棚からの削除に失敗しました" });
  }

  // 仮のデータベースを使っている時の書き方
  // 本棚に存在するか確認
  // const index = bookshelf.findIndex((book) => book.id == id);
  // if (index === -1) {
  //   return res.status(404).json({ error: "指定された本が本棚にありません。" });
  // }

  // 本棚から削除
  // bookshelf.splice(index, 1);
  // console.log("本棚の内容:", bookshelf);
  // return res.status(200).json({ message: "本棚から削除しました" });
});

module.exports = router;
