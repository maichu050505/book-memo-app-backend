const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// 読書状況の取得エンドポイント（authMiddleware を利用）
router.get("/users/:userId/bookshelf/:bookId/status", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  // req.user は authMiddleware によってセットされているはず
  const userId = req.user.id;
  try {
    const statusRecord = await prisma.booksBookshelf.findFirst({
      where: {
        bookId: Number(bookId),
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

module.exports = router;
