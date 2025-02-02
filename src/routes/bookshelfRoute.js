const express = require("express");
const { PrismaClient } = require("@prisma/client"); // Prisma クライアントのインポート
const router = express.Router();

const prisma = new PrismaClient();

// ボディデータのパース用ミドルウェア
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // JSON形式をパースするために必要

//仮のデータベース
// const { books, bookshelf } = require("../database");

// 本棚登録用エンドポイント(POST books/bookshelf)
router.post("/books/bookshelf", async (req, res) => {
  const { id } = req.body;
  //リクエストの body に id が含まれているか確認。含まれていない場合、ステータスコード 400 (Bad Request) とエラーメッセージを返します。
  if (!id) {
    return res.status(400).json({ error: "idが指定されていません" });
  }

  try {
    // 書籍が存在するか確認
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    // 書籍が存在しない場合は404エラーを返す
    if (!book) {
      return res.status(404).json({ error: "指定された本が見つかりませんでした。" });
    }

    // 本棚に既に登録されているか確認
    const isExist = await prisma.bookshelf.findUnique({
      where: { bookId: parseInt(id) },
    });

    // すでに登録済みの場合は「登録しました」と 201 を返す
    if (isExist) {
      return res.status(201).json({ message: "登録しました" });
    }

    // 本棚に書籍を登録
    await prisma.bookshelf.create({
      data: {
        bookId: parseInt(id),
      },
    });

    res.status(201).json({ message: "登録しました" });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
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

// 本棚から削除するエンドポイント (DELETE /books/bookshelf)
router.delete("/books/bookshelf", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "idが指定されていません" });
  }

  try {
    // 本棚に存在するか確認
    const isExist = await prisma.bookshelf.findUnique({
      where: { bookId: parseInt(id) },
    });

    if (!isExist) {
      return res.status(404).json({ error: "指定された本が本棚にありません。" });
    }

    // 本棚から削除
    await prisma.bookshelf.delete({
      where: { bookId: parseInt(id) },
    });

    res.status(200).json({ message: "本棚から削除しました" });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
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

// 本棚の内容を取得するエンドポイント (GET books/bookshelf)
router.get("/books/bookshelf", async (req, res) => {
  try {
    console.log("GET /books/bookshelf リクエストを受信しました");
    console.log("リクエストヘッダ:", req.headers);
    console.log("リクエストボディ:", req.body);

    // Prismaで本棚データを取得
    const bookshelf = await prisma.bookshelf.findMany({
      include: {
        book: true, // 本の情報を一緒に取得
      },
    });

    console.log("取得した本棚データ:", bookshelf);

    // 本棚が空でも空配列を返す
    res.status(200).json(bookshelf || []);
  } catch (error) {
    console.error("サーバーエラー:", error.message, error.stack);
    res.status(500).json({ error: "サーバー内部エラーが発生しました。" });
  }

  // 仮のデータベースを使っている時の書き方
  // bookshelf 配列をそのまま返す
  // res.json(bookshelf);
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

