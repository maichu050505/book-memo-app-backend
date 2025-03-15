const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// すべてのレビュー（他ユーザーも含む）を取得するエンドポイント
router.get("/books/:bookId/reviews", async (req, res) => {
  const { bookId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { bookId: Number(bookId) },
      orderBy: { date: "desc" },
      include: { user: true },
    });
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("他ユーザーのレビュー取得エラー:", error);
    res.status(500).json({ error: "レビューの取得に失敗しました" });
  }
});

module.exports = router;
