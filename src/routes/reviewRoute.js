const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

//仮のデータベース
// const { books, review } = require("../database");

// 指定された本のレビューを取得
router.get("/reviews/:bookId", async (req, res) => {
  const { bookId } = req.params;

  // Prismaを使う時の書き方
  try {
    const reviews = await prisma.review.findMany({
      where: { bookId: parseInt(bookId) },
    });

    if (!reviews.length) {
      return res.status(200).json({ reviewText: "", rating: 0, date: null });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
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
router.post("/reviews/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const { reviewText, rating, date } = req.body;

  // Prismaを使う時の書き方
  try {
    const existingReview = await prisma.review.findFirst({
      where: { bookId: parseInt(bookId) },
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
        reviewText,
        rating,
        date: new Date(date),
      },
    });

    res.status(201).json({ message: "レビューが追加されました", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
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
router.delete("/reviews/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    await prisma.review.deleteMany({ where: { bookId: parseInt(bookId) } });
    res.status(200).json({ message: "レビューが削除されました" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
  }

  // Prismaを使う時の書き方
  try {
    await prisma.review.deleteMany({ where: { bookId: parseInt(bookId) } });
    res.status(200).json({ message: "レビューが削除されました" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
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

// http://localhost:3000/books/reviews/ で確認するため
router.get("/reviews", (req, res) => {
  // データベースの内容を返す
  res.status(200).json({
    reviews: review, 
    test: []
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
