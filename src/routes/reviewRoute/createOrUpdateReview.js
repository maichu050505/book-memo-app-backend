const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// レビューの新規作成または更新エンドポイント
router.post("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
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
    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { reviewText, rating, date: new Date(date) },
      });
      return res.status(200).json({ message: "レビューが更新されました", review: updatedReview });
    }
    const newReview = await prisma.review.create({
      data: {
        bookId: parseInt(bookId),
        userId: Number(userId),
        reviewText,
        rating,
        date: new Date(date),
      },
    });
    res.status(201).json({ message: "レビューが追加されました", review: newReview });
  } catch (error) {
    console.error("レビュー保存エラー:", error);
    res.status(500).json({ error: "レビューの保存に失敗しました" });
  }
});

module.exports = router;
