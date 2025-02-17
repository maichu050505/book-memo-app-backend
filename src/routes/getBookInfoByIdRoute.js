const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

//仮のデータベース
// const { books } = require("../database");

// 本の情報取得エンドポイント
router.get("/books/getBookInfoById", async (req, res) => {
  const { id } = req.query; // クエリパラメータを取得
  if (!id) {
    return res.status(400).json({ error: "IDがありません" });
  }

  // Prismaを使う時の書き方
  try {
    // Prisma で Book テーブルから ID を指定して検索
    const book = await prisma.book.findUnique({
      where: {
        id: Number(id), // id を整数型に変換（Prisma の型に合わせる）
      },
    });

    // 本が見つからない場合
    if (!book) {
      return res.status(404).json({ error: "指定された本が見つかりませんでした" });
    }

    // 結果を返す
    res.json(book);
  } catch (error) {
    console.error("データ取得エラー:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }

  // 仮のデータベースを使っていた時の書き方
  // // 本の情報取得処理
  // const results = books.filter((book) => {
  //   return book.id == id; //　===だと型を含めて一致しているかになってしまう。idが文字列で取ってきてしまう。
  // });

  // // 本が見つからない場合
  // if (results.length === 0) {
  //   return res.status(404).json({ error: "指定された本が見つかりませんでした" });
  // }

  // // 結果を返す
  // res.json(results[0]);
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

