const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const prisma = new PrismaClient();

// 特定の本のレビュー数を取得するエンドポイント
router.get("/books/:bookId/reviews/count", async (req, res) => {
  const bookId = parseInt(req.params.bookId, 10);
  try {
    const count = await prisma.review.count({
      where: { bookId: bookId },
    });
    res.json({ count });
  } catch (error) {
    console.error("レビュー数の取得エラー:", error);
    res.status(500).json({ error: "レビュー数の取得に失敗しました" });
  }
});

module.exports = router;
