const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 本棚登録用エンドポイント
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

module.exports = router;
