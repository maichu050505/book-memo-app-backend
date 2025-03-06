const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

//仮のデータベース
// const { books, review } = require("../database");

// 指定された本のレビューを取得
router.get("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id; // userId は認証済みの req.user から取得
  // Prismaを使う時の書き方
  try {
    const review = await prisma.review.findFirst({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });

    if (!review) {
      // レビューが存在しない場合は空のレビューオブジェクトを返す
      return res.status(200).json({ reviewText: "", rating: 0, date: null });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("レビュー取得エラー:", error);
    res.status(500).json({ error: "レビューの取得に失敗しました" });
  }

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
});

// 新しいレビューを追加または既存のレビューを更新
router.post("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const { reviewText, rating, date } = req.body;
  // Prismaを使う時の書き方
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });
    // 既存レビューがあれば更新
    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { reviewText, rating, date: new Date(date) },
      });
      return res.status(200).json({ message: "レビューが更新されました", review: updatedReview });
    }
    // 存在しなければ新規作成
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

  // 仮のデータベースを使っていた時の書き方
  // // `books`に該当する本が存在するか確認
  // const bookExists = books.some((b) => b.id.toString() === bookId);
  // if (!bookExists) {
  //   return res.status(404).json({ error: "指定された本が見つかりません" });
  // }

  // // 既存のレビューを検索
  // const existingReviewIndex = review.findIndex((r) => r.bookId === bookId);

  // if (existingReviewIndex !== -1) {
  //   // レビューを更新
  //   review[existingReviewIndex] = { bookId, reviewText, rating, date };
  //   console.log("更新されたレビュー:", review[existingReviewIndex]);
  //   return res.status(200).json({ message: "レビューが更新されました", review: review[existingReviewIndex] });
  // }

  // // 新しいレビューを追加
  // const newReview = { bookId, reviewText, rating, date };
  // review.push(newReview);
  // console.log("新しいレビューが保存されました:", newReview);
  // res.status(201).json({ message: "レビューが保存されました", review: newReview });
});

// 仮のデータベースを使っていた時の書き方
// router.put("/reviews/:bookId", (req, res) => {
//   const { bookId } = req.params;
//   const { reviewText, rating, date } = req.body;

//   console.log("現在のレビュー一覧:", review);
//   console.log("リクエストされたbookId:", bookId);

//   const reviewIndex = review.findIndex((r) => r.bookId === bookId);
//   if (reviewIndex === -1) {
//     console.log("レビューが見つかりません:", bookId);
//     return res.status(404).json({ error: "レビューが見つかりません" });
//   }

//   review[reviewIndex] = { bookId, reviewText, rating, date };
//   console.log("更新されたレビュー:", review[reviewIndex]);
//   res.status(200).json({ message: "レビューが更新されました", review: review[reviewIndex] });
// });

// レビューを削除するエンドポイント
router.delete("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  // Prismaを使う時の書き方
  try {
    const deleted = await prisma.review.deleteMany({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });
    if (deleted.count === 0) {
      return res.status(404).json({ error: "レビューが見つかりません" });
    }
    res.status(200).json({ message: "レビューが削除されました" });
  } catch (error) {
    console.error("レビュー削除エラー:", error);
    res.status(500).json({ error: "レビューの削除に失敗しました" });
  }

  // 仮のデータベースを使っていた時の書き方
  // // `review`から指定された本のレビューを削除
  // const reviewIndex = review.findIndex((r) => r.bookId === bookId);
  // if (reviewIndex === -1) {
  //   return res.status(404).json({ error: "レビューが見つかりません" });
  // }

  // // レビューを削除
  // review.splice(reviewIndex, 1);
  // console.log(`レビューが削除されました (bookId=${bookId})`);

  // res.status(200).json({ message: "レビューが削除されました" });
});

// 更新用エンドポイント
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

// http://localhost:3000/books/reviews/ で確認するため
router.get("/books/reviews", (req, res) => {
  // データベースの内容を返す
  res.status(200).json({
    reviews: review,
    test: [],
  });
});
module.exports = router;

//直接実行のためのコード
if (require.main === module) {
  const express = require("express");
  const app = express();

  app.use("/books", router);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
