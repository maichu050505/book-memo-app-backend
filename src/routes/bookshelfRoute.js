const express = require("express");
const router = express.Router();

// ボディデータのパース用ミドルウェア
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // JSON形式をパースするために必要

//仮のデータベース
const { books, bookshelf } = require("../database");

// 本棚登録用エンドポイント(POST /bookshelf)
router.post("/bookshelf", (req, res) => {
  const { id } = req.body;
  //リクエストの body に id が含まれているか確認。含まれていない場合、ステータスコード 400 (Bad Request) とエラーメッセージを返します。
  if (!id) {
    return res.status(400).json({ error: "idが指定されていません" });
  }

  // あれば、本棚に登録する
  console.log(books);
  console.log(bookshelf);

  // idの書籍データがあるか確認する
  const target = books.find((book) => book.id == id);
  // 存在しない場合は 404 (Not Found) を返します。
  if (!target) {
    return res.status(404).json({ error: "指定された本が見つかりませんでした。" });
  }

  //重複しないようにすでに本棚に登録されているか確認
  const isExist = bookshelf.some((book) => book.id == id);
  //すでに登録済みの場合は「登録しました」と 201 を返します。
  if (isExist) {
    console.log("本棚の内容:", bookshelf); // 本棚をログに出力
    return res.status(201).json({ message: "登録しました" });
  }
  //本棚に登録 (重複がない場合のみ)　登録されていない場合は、bookshelf に id を追加し、「登録しました」とレスポンスします。
  bookshelf.push({ id: target.id });
  console.log("本棚の内容:", bookshelf); // 本棚をログに出力
  return res.status(201).json({ message: "登録しました" });

  // 結果を返す
  //res.json({});
});

// 本棚から削除するエンドポイント
router.delete("/bookshelf", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "idが指定されていません" });
  }

  // 本棚に存在するか確認
  const index = bookshelf.findIndex((book) => book.id == id);
  if (index === -1) {
    return res.status(404).json({ error: "指定された本が本棚にありません。" });
  }

  // 本棚から削除
  bookshelf.splice(index, 1);
  console.log("本棚の内容:", bookshelf);
  return res.status(200).json({ message: "本棚から削除しました" });
});

// 本棚の内容を取得するエンドポイント (GET /bookshelf)
router.get("/bookshelf", (req, res) => {
  // bookshelf 配列をそのまま返す
  res.json(bookshelf);
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

