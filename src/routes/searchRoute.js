const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

//仮のデータベース
// const { books } = require("../database");

// 書籍検索用エンドポイント
router.get("/books/search", async (req, res) => {
  const { query } = req.query; // クエリパラメータを取得
  console.log("検索リクエストを受け付けました:", query); // リクエスト内容をログに表示
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // データベースから書籍を取得
    const books = await prisma.book.findMany();

    if (!books || books.length === 0) {
      return res.status(404).json({ message: "データが見つかりません" });
    }

    // クエリを正規化する関数
    const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, "");

    const normalizedQuery = normalizeString(query);

    // フィルタリング処理
    const results = books.filter((book) => {
      if (!book.title || !book.author) return false;

      const normalizedTitle = normalizeString(book.title);
      const normalizedAuthor = normalizeString(book.author);

      return (
        normalizedTitle.includes(normalizedQuery) || normalizedAuthor.includes(normalizedQuery)
      );
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "該当する書籍が見つかりません" });
    }

    res.json({ results });
  } catch (error) {
    console.error("データ取得エラー:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
  // 仮のデータベースを使っていた時の書き方
  // // クエリを正規化する関数
  // const normalizeString = (str) =>
  //   str
  //     .toLowerCase() // 小文字化
  //     .replace(/\s+/g, ""); // すべてのスペースを削除

  // // クエリを正規化
  // const normalizedQuery = normalizeString(query);

  // // 検索処理
  // const results = books.filter((book) => {
  //   // タイトルと著者名を正規化して比較
  //   const normalizedTitle = normalizeString(book.title);
  //   const normalizedAuthor = normalizeString(book.author);

  //   return normalizedTitle.includes(normalizedQuery) || normalizedAuthor.includes(normalizedQuery); //部分一致
  //   // return book.title === query || book.author === query; //完全一致
  // });

  // // 見つからない場合
  // if (results.length === 0) {
  //   return res.status(404).send({ message: "見つかりません" });
  // }

  // // 結果を返す
  // res.json({ results });
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


//テスト用
// const router = express.Router();

// const books = [];

// router.get("/serach", (req, res) => {
//     const params = req.query;

//     const title = params.title;

//     const result = books.filter((book) => {
//         return book.title.includes(title);
//     });
//     res.json(result);
// })

// module.exports = router;
