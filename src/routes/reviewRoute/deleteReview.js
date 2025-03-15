const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();
const prisma = new PrismaClient();

// レビューの削除エンドポイント
router.delete("/users/:userId/bookshelf/:bookId/reviews", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  try {
    const deleted = await prisma.review.deleteMany({
      where: {
        bookId: Number(bookId),
        userId: Number(userId),
      },
    });
    if (deleted.count === 0) {
      return res.status(404).json({ error: "レビューが見つかりません" });
    }
    res.status(200).json({ message: "レビューが削除されました" });
  } catch (error) {
    console.error("レビュー削除エラー:", error);
    res.status(500).json({ error: "レビューの削除に失敗しました" });
  }
});

module.exports = router;
