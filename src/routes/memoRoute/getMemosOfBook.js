const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// 指定された本のメモを取得 (すべて)
// /books/:bookId/memos/
router.get("/memos/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    console.log(`取得リクエスト: /memos/${bookId}, 型: ${typeof bookId}`);

    if (!bookId) {
      return res.status(400).json({ error: "bookId が必要です" });
    }

    const bookIdNumber = Number(bookId);
    if (isNaN(bookIdNumber)) {
      return res.status(400).json({ error: "bookId は数値である必要があります" });
    }

    const memos = await prisma.memo.findMany({
      where: { bookId: bookIdNumber }, // `bookId` を `Number` に変換
      orderBy: { createdAt: "asc" }, // 古いメモが上に、新しいメモが下に表示
    });

    console.log("取得したメモ:", JSON.stringify(memos, null, 2));
    res.json({ memos });
  } catch (error) {
    console.error("メモ取得エラー:", error);
    res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

exports.router = router;
