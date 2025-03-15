const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// ユーザー本人のレビュー取得エンドポイント
router.get("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  try {
    const review = await prisma.review.findFirst({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });
    if (!review) {
      // レビューが存在しない場合は空のオブジェクトを返す
      return res.status(200).json({ reviewText: "", rating: 0, date: null });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error("レビュー取得エラー:", error);
    res.status(500).json({ error: "レビューの取得に失敗しました" });
  }
});

// 仮のデータベースを使っていた時の書き方
// // `books`に該当する本が存在するか確認
// const bookExists = books.some((b) => b.id.toString() === bookId);
// if (!bookExists) {
//   return res.status(404).json({ error: "指定された本が見つかりません" });
// }

// // `review`に対応するレビューが存在するか確認
// const bookReview = review.find((r) => r.bookId === bookId);
// if (!bookReview) {
//   return res.status(200).json({ reviewText: "", rating: 0, date: null }); // 空のレビューを返す
// }

// res.status(200).json(bookReview);

module.exports = router;
