const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const demoReadOnly = require("../../middlewares/demoReadOnly");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const prisma = new PrismaClient();

// 特定のメモを削除
router.delete(
  "/users/:userId/bookshelf/:bookId/memos/:id",
  authMiddleware,
  demoReadOnly,
  async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`メモ削除リクエスト: ID=${id}`);

      // メモが存在するか確認
      const existingMemo = await prisma.memo.findUnique({ where: { id: Number(id) } });

      if (!existingMemo) {
        return res.status(404).json({ error: "メモが見つかりません" });
      }

      // 画像がある場合、サーバーから削除
      if (existingMemo.memoImg) {
        const imagePaths = existingMemo.memoImg.split("||"); // `||` で複数画像を分割
        imagePaths.forEach((imgPath) => {
          const filePath = path.join(__dirname, "..", imgPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`画像削除: ${filePath}`);
          }
        });
      }

      // メモ削除
      await prisma.memo.delete({ where: { id: Number(id) } });

      console.log(`メモ削除成功: ID=${id}`);
      res.json({ message: "メモを削除しました" });
    } catch (error) {
      console.error("メモ削除エラー:", error);
      res.status(500).json({ error: "メモの削除に失敗しました" });
    }
  }
);

module.exports = router;
