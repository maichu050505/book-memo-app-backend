const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const demoReadOnly = require("../../middlewares/demoReadOnly");
const { upload } = require("./uploadConfig");

const router = express.Router();
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

// 特定のメモを更新
router.put(
  "/users/:userId/bookshelf/:bookId/memos/:id",
  authMiddleware,
  demoReadOnly,
  upload.array("memoImg", 5),
  async (req, res) => {
    try {
      const { id, bookId } = req.params;
      const userId = req.user.id;
      const { memoText } = req.body;
      let deletedImages = req.body.deletedImages; // フロントから送信された削除対象画像パス

      console.log(`メモ更新リクエスト: ID=${id}, memoText=${memoText}, bookId=${bookId}`);
      console.log(`削除画像リスト:`, deletedImages);

      const existingMemo = await prisma.memo.findUnique({ where: { id: Number(id) } });

      if (!existingMemo) {
        return res.status(404).json({ error: "メモが見つかりません" });
      }

      let memoImg = existingMemo.memoImg ? existingMemo.memoImg.split("||") : [];

      // **削除する画像があれば処理**
      if (deletedImages) {
        if (!Array.isArray(deletedImages)) {
          deletedImages = [deletedImages]; // 1つの画像でも配列化
        }

        deletedImages.forEach((imgPath) => {
          const fullPath = path.join(__dirname, "..", imgPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`削除した画像: ${fullPath}`);
          }
        });

        // **削除した画像を `memoImg` 配列から除去**
        memoImg = memoImg.filter((img) => !deletedImages.includes(img));
      }

      // **新しい画像を追加**
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/${file.filename}`);
        memoImg = [...memoImg, ...newImages];
      }

      console.log(`最終的に保存する画像リスト: ${memoImg.join("||")}`);

      const updatedMemo = await prisma.memo.update({
        where: { id: Number(id) },
        data: {
          memoText,
          bookId: Number(bookId),
          memoImg: memoImg.length > 0 ? memoImg.join("||") : "",
        },
      });

      console.log("更新されたメモ:", updatedMemo);
      res.json({ memo: updatedMemo });
    } catch (error) {
      console.error("メモ更新エラー:", error);
      res.status(500).json({ error: "メモの更新に失敗しました" });
    }
  }
);

// 仮のデータベースを使っていた時の書き方
// router.put("/memos/:memoId", async (req, res) => {
//   const { memoId } = req.params; // URLパラメータから取得
//   const { memoText, memoImg } = req.body; // リクエストボディから取得
//   console.log("PUTリクエストを受信:", { memoText, memoImg, memoId });

//   // // 対象のメモを検索
//   // const memoIndex = memo.findIndex((m) => m.bookId == bookId && m.memoId == memoId);
//   // if (memoIndex === -1) {
//   //   console.error("メモが見つかりません:", { bookId, memoId });
//   //   return res.status(404).json({ error: "メモが見つかりません" });
//   // }

//   // // メモを更新
//   // memo[memoIndex] = { bookId, memoText, memoImg, memoId };
//   // console.log("更新されたメモ:", memo[memoIndex]);
//   // res.status(200).json({ message: "メモが更新されました", memo: memo[memoIndex] });
// });

module.exports = router;
