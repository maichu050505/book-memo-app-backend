const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// 特定の本に紐づくメモを取得するエンドポイント
router.get("/books/:bookId/memos", async (req, res) => {
  const { bookId } = req.params;

  try {
    const memos = await prisma.memo.findMany({
      where: { bookId: Number(bookId) },
    });

    return res.json(memos);
  } catch (error) {
    console.error("メモ取得エラー:", error);
    return res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

module.exports = router;
