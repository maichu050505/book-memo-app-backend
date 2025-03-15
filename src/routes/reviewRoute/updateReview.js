const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

//　更新用エンドポイント
router.put("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const { reviewText, rating, date } = req.body;
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });
    if (!existingReview) {
      return res.status(404).json({ error: "レビューが見つかりません" });
    }
    const updatedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: { reviewText, rating, date: new Date(date) },
    });
    res.status(200).json({ message: "レビューが更新されました", review: updatedReview });
  } catch (error) {
    console.error("レビュー更新エラー:", error);
    res.status(500).json({ error: "レビューの更新に失敗しました" });
  }
});

module.exports = router;
