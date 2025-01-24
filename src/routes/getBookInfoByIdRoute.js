const express = require("express");
const router = express.Router();

//仮のデータベース
const { books } = require("../database");

// 本の情報取得エンドポイント
router.get("/getBookInfoById", (req, res) => {
  const { id } = req.query; // クエリパラメータを取得
  if (!id) {
    return res.status(400).json({ error: "IDがありません" });
  }

  // 本の情報取得処理
  const results = books.filter((book) => {
      return book.id == id; //　===だと型を含めて一致しているかになってしまう。idが文字列で取ってきてしまう。
      
  });

  if (!results) {
    return res.status(404).json({ error: "指定された本が見つかりませんでした" });
  }

  // 結果を返す
  res.json( results[0] );
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

