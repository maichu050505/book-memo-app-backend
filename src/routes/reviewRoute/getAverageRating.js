const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// 指定した本の平均評価を取得するエンドポイント
router.get("/books/:bookId/reviews/average-rating", async (req, res) => {
  const { bookId } = req.params;
  try {
    const averageRating = await prisma.review.aggregate({
      where: { bookId: Number(bookId) },
      _avg: { rating: true },
    });
    return res.json({ averageRating: averageRating._avg.rating || 0 });
  } catch (error) {
    console.error("平均評価の取得エラー:", error);
    return res.status(500).json({ error: "平均評価の取得に失敗しました" });
  }
});

module.exports = router;
