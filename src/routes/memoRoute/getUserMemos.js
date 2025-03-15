const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// 指定されたユーザーの本に紐づくメモ一覧を取得
router.get("/users/:userId/bookshelf/:bookId/memos", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    if (!bookId) {
      return res.status(400).json({ error: "bookId が必要です" });
    }
    const bookIdNumber = Number(bookId);
    if (isNaN(bookIdNumber)) {
      return res.status(400).json({ error: "bookId は数値である必要があります" });
    }

    const memos = await prisma.memo.findMany({
      where: { bookId: bookIdNumber }, // `bookId` を `Number` に変換
      orderBy: { createdAt: "asc" }, // 古いメモが上に、新しいメモが下に表示
    });

    console.log("取得したメモ:", JSON.stringify(memos, null, 2));
    res.json({ memos });
  } catch (error) {
    console.error("メモ取得エラー:", error);
    res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

module.exports = { router };
