const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 本棚の内容を取得するエンドポイント (GET /users/:userId/bookshelf)
router.get("/users/:userId/bookshelf", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { filter } = req.query; // filter=all, want, now, done
  try {
    // Prismaで本棚データを取得
    // userId に紐づく本棚を取得（中間テーブル経由で書籍情報を含む）
    let bookshelf = await prisma.bookshelf.findUnique({
      where: { userId: Number(userId) },
      include: {
        books: {
          include: { book: true },
        },
      },
    });
    // 本棚レコードが存在しない場合、自動で本棚を作成する
    if (!bookshelf) {
      bookshelf = await prisma.bookshelf.create({
        data: {
          userId: Number(userId),
        },
        include: { books: { include: { book: true } } },
      });
      // まだ本が登録されていないので、空の配列を返す
      return res.json([]);
    }

    console.log("取得した本棚データ:", bookshelf);

    // filter が "all" 以外の場合は、ステータスで絞り込み
    let filteredBooks = bookshelf.books;
    if (filter && filter !== "all") {
      const statusMapping = {
        want: "WANT_TO_READ",
        now: "READING_NOW",
        done: "READ",
      };
      filteredBooks = bookshelf.books.filter((entry) => entry.status === statusMapping[filter]);
    }

    // 返すデータとして、Book モデルの情報を整形して返す。各エントリーの book プロパティのみ返す。
    const books = filteredBooks.map((entry) => entry.book);
    res.json(books);
  } catch (error) {
    console.error("本棚取得エラー:", error);
    res.status(500).json({ error: "本棚の取得に失敗しました" });
  }
});

module.exports = router;
