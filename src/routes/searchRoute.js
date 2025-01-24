const express = require("express");
const router = express.Router();

//仮のデータベース
const { books } = require("../database");

// 書籍検索用エンドポイント
router.get("/search", (req, res) => {
  const { query }  = req.query; // クエリパラメータを取得
  console.log("検索リクエストを受け付けました:", query); // リクエスト内容をログに表示
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  // 検索処理
  const results = books.filter((book) => {
    return book.title.includes(query) || book.author.includes(query);//部分一致
    // return book.title === query || book.author === query; //完全一致
  }); 

  // 見つからない場合
  if (results.length === 0) {
    return res.status(404).send({ message: "見つかりません" });
  }

  // 結果を返す
  res.json({ results });
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
