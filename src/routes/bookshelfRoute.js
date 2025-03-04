const express = require("express");
const { PrismaClient } = require("@prisma/client"); // Prisma クライアントのインポート
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// ボディデータのパース用ミドルウェア
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // JSON形式をパースするために必要

//仮のデータベース
// const { books, bookshelf } = require("../database");

// 本棚登録用エンドポイント(POST books/bookshelf)
router.post("/users/:userId/bookshelf", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { bookId } = req.body;
  //リクエストの body に id が含まれているか確認。含まれていない場合、ステータスコード 400 (Bad Request) とエラーメッセージを返します。
  if (!bookId) {
    return res.status(400).json({ error: "bookIdが指定されていません" });
  }

  try {
    // 書籍が存在するか確認
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) },
    });

    // 書籍が存在しない場合は404エラーを返す
    if (!book) {
      return res.status(404).json({ error: "指定された本が見つかりませんでした。" });
    }

    // 本棚に既に登録されているか確認
    const existingRecord = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(bookId),
        bookshelf: { userId: Number(userId) },
      },
    });
    if (existingRecord) {
      return res.status(400).json({ error: "本はすでに登録されています" });
    }

    // 本棚に書籍を登録（初期の読書状況は "WANT_TO_READ" とする）
    const newRecord = await prisma.booksBookshelf.create({
      data: {
        bookshelf: { connect: { userId: Number(userId) } },
        status: "WANT_TO_READ",
        book: { connect: { id: Number(bookId) } }, // ここで関連する Book レコードとの接続を指定する
      },
    });

    res.status(201).json({ message: "登録しました", record: newRecord });
  } catch (error) {
    console.error("本棚への登録エラー:", error);
    res.status(500).json({ error: "本棚への登録に失敗しました" });
  }

  // 仮のデータベースを使っている時の書き方
  // あれば、本棚に登録する
  // console.log(books);
  // console.log(bookshelf);

  // idの書籍データがあるか確認する
  // const target = books.find((book) => book.id == id);
  // 存在しない場合は 404 (Not Found) を返します。
  // if (!target) {
  //   return res.status(404).json({ error: "指定された本が見つかりませんでした。" });
  // }

  //重複しないようにすでに本棚に登録されているか確認
  // const isExist = bookshelf.some((book) => book.id == id);
  //すでに登録済みの場合は「登録しました」と 201 を返します。
  // if (isExist) {
  //   console.log("本棚の内容:", bookshelf); // 本棚をログに出力
  //   return res.status(201).json({ message: "登録しました" });
  // }
  //本棚に登録 (重複がない場合のみ)　登録されていない場合は、bookshelf に id を追加し、「登録しました」とレスポンスします。
  // bookshelf.push({ id: target.id });
  // console.log("本棚の内容:", bookshelf); // 本棚をログに出力
  // return res.status(201).json({ message: "登録しました" });

  // 結果を返す
  //res.json({});
});

// 本棚から削除するエンドポイント (DELETE /users/:userId/bookshelf/:bookId)
router.delete("/users/:userId/bookshelf/:bookId", authMiddleware, async (req, res) => {
  const { userId, bookId } = req.params;
  if (!bookId) {
    return res.status(400).json({ error: "bookIdが指定されていません" });
  }

  try {
    // ユーザーの本棚から対象の書籍登録レコードを探す
    const record = await prisma.bookshelf.findFirst({
      where: {
        bookId: Number(bookId),
        bookshelf: { userId: Number(userId) },
      },
    });
    if (!record) {
      return res.status(404).json({ error: "本棚に登録されていません。" });
    }

    // BooksBookshelf テーブルから該当レコードを削除する
    await prisma.booksBookshelf.delete({
      where: { id: record.id },
    });

    res.status(200).json({ message: "本棚から削除しました" });
  } catch (error) {
    console.error("削除エラー:", error);
    res.status(500).json({ error: "本棚からの削除に失敗しました" });
  }

  // 仮のデータベースを使っている時の書き方
  // 本棚に存在するか確認
  // const index = bookshelf.findIndex((book) => book.id == id);
  // if (index === -1) {
  //   return res.status(404).json({ error: "指定された本が本棚にありません。" });
  // }

  // 本棚から削除
  // bookshelf.splice(index, 1);
  // console.log("本棚の内容:", bookshelf);
  // return res.status(200).json({ message: "本棚から削除しました" });
});

// 本棚の内容を取得するエンドポイント (GET /users/:userId/bookshelf)
router.get("/users/:userId/bookshelf", async (req, res) => {
  const { userId } = req.params;
  const { filter } = req.query; // filter=all, want, now, done
  try {
    // Prismaで本棚データを取得
    // userId に紐づく本棚を取得（中間テーブル経由で書籍情報を含む）
    const bookshelf = await prisma.bookshelf.findUnique({
      where: { userId: Number(userId) },
      include: {
        books: {
          include: { book: true },
        },
      },
    });
    if (!bookshelf) {
      return res.status(404).json({ error: "本棚が見つかりません" });
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

//直接実行のためのコード
// if (require.main === module) {
//   const express = require("express");
//   const app = express();

//   app.use("/books", router);

//   app.listen(3000, () => {
//     console.log("Server is running on http://localhost:3000");
//   });
// }
