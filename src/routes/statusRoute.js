const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// 読書状況の取得エンドポイント
router.get("/books/:id/status", async (req, res) => {
  const { id } = req.params;
  const dummyUserId = 1; // 仮のユーザーID
  try {
    // BooksBookshelf を検索する際、関連する本棚の userId がダミーのユーザーIDであるものを対象にします。
    const statusRecord = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(id),
        bookshelf: {
          userId: dummyUserId,
        },
      },
    });
    if (!statusRecord) {
      return res.status(404).json({ error: "ステータスが見つかりません" });
    }
    res.json({ status: statusRecord.status });
  } catch (error) {
    console.error("ステータス取得エラー:", error);
    res.status(500).json({ error: "ステータス取得に失敗しました" });
  }
});

// 読書状況の更新エンドポイント
router.put("/books/:id/status", async (req, res) => {
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
if (require.main === module) {
  const express = require("express");
  const app = express();

  app.use("/books", router);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
