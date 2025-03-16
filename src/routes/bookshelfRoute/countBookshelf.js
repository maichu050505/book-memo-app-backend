const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 特定の本を本棚に登録しているユーザー数を取得するエンドポイント
router.get("/books/:bookId/bookshelf/count", async (req, res) => {
  const { bookId } = req.params;

  try {
    // Prisma で該当の本を本棚に登録しているユーザー数を取得
    const count = await prisma.booksBookshelf.count({
      where: {
        bookId: Number(bookId), // bookId に一致するレコードをカウント
      },
    });

    return res.json({ count });
  } catch (error) {
    console.error("本棚登録者数の取得エラー:", error);
    return res.status(500).json({ error: "本棚登録者数の取得に失敗しました" });
  }
});

module.exports = router;
