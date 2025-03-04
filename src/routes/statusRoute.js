const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middlewares/authMiddleware"); // 適切なパスに変更

const router = express.Router();
const prisma = new PrismaClient();

// 読書状況の取得エンドポイント（authMiddleware を利用）
router.get("/users/:userId/books/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  // req.user は authMiddleware によってセットされているはず
  const userId = req.user.id;
  try {
    const statusRecord = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(id),
        bookshelf: {
          userId: { equals: Number(userId) },
        },
      },
    });
    if (!statusRecord) {
      // 本棚に本が登録されていない、または該当の本が登録されていない場合のデフォルトレスポンス
      return res.status(200).json({ status: null, message: "本棚に本が登録されていません" });
    }
    res.json({ status: statusRecord.status });
  } catch (error) {
    console.error("ステータス取得エラー:", error);
    res.status(500).json({ error: "ステータス取得に失敗しました" });
  }
});

// 読書状況の更新エンドポイント
router.put("/users/:userId/books/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "WANT_TO_READ", "READING_NOW", "READ" のいずれかを受け取る
  try {
    const updatedBook = await prisma.book.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "ステータスの更新に失敗しました" });
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
