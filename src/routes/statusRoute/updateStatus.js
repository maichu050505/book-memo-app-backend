const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 読書状況の更新エンドポイント
router.put("/users/:userId/bookshelf/:bookId/status", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const { status } = req.body; // "WANT_TO_READ", "READING_NOW", "READ" のいずれかを受け取る
  try {
    // まず、対象の BooksBookshelf レコードを取得
    const record = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(bookId),
        bookshelf: { userId: Number(userId) },
      },
    });
    if (!record) {
      return res.status(404).json({ error: "本棚に登録されていません" });
    }
    // そのレコードの status を更新
    const updatedRecord = await prisma.booksBookshelf.update({
      where: { id: record.id },
      data: { status },
    });
    res.json(updatedRecord);
  } catch (error) {
    console.error("ステータス更新エラー詳細:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "ステータスの更新に失敗しました" });
  }
});

module.exports = router;
