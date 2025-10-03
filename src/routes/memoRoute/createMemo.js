const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const { upload } = require("./uploadConfig");
const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = process.env.SUPABASE_PUBLIC_BUCKET || "memo-images";

function toSafeJpegName(originalName = "image") {
  const base = originalName.replace(/\.[^.]+$/, "");
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .slice(0, 50) || "img";
  return `${Date.now()}-${slug}.jpg`;
}

// メモの新規追加
router.post(
  "/users/:userId/bookshelf/:bookId/memos",
  authMiddleware,
  upload.array("memoImg", 5),
  async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user.id;
    const { memoText } = req.body;
    try {
      // 他人の userId での操作を禁止
      const paramUserId = Number(req.params.userId);
      if (Number.isFinite(paramUserId) && paramUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: userId mismatch" });
      }

      const { bookId } = req.params;
      const userId = req.user.id;
      const { memoText } = req.body;

      const urls = [];

      for (const file of req.files || []) {
        const isHeic =
          /heic|heif/i.test(file.mimetype) || /\.heic$|\.heif$/i.test(file.originalname);

        // すべてJPEGに寄せる（HEIC/HEIFは必ず変換）
        const buf = await sharp(file.buffer).jpeg({ quality: 85 }).toBuffer();

        const filename = toSafeJpegName(file.originalname);
        const pathInBucket = `users/${userId}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(pathInBucket, buf, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return res.status(500).json({ error: "画像の保存に失敗しました" });
        }

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(pathInBucket);

        urls.push(pub.publicUrl); // ← 公開URLをDBへ
      }

      const newMemo = await prisma.memo.create({
        data: {
          memoText,
          memoImg: urls.length ? urls.join("||") : "",
          book: { connect: { id: Number(bookId) } },
          user: { connect: { id: Number(userId) } },
        },
      });

      return res.status(201).json({ memo: newMemo });
    } catch (error) {
      console.error("メモ作成エラー:", error);
      res.status(500).json({ error: "メモの作成に失敗しました" });
    }
  }
);

//仮のデータベースを使っていた時の書き方
// router.post("/memos/:bookId", async (req, res) => {
//   console.log("リクエストボディ:", JSON.stringify(req.body).length, "bytes");
//   const { bookId } = req.params;
//   let { memoText, memoImg } = req.body;

//   console.log("リクエストボディ:", req.body);

//     // 本が存在するか確認
//     // const bookExists = books.some((b) => b.id.toString() == bookId);
//     // if (!bookExists) {
//     //   return res.status(404).json({ error: "指定された本が見つかりません" });
//     // }

//     // // 新しいメモを追加
//     // const newMemo = {
//     //   bookId,
//     //   memoText,
//     //   memoImg,
//     //   memoId: Date.now(), // 一意のIDを生成
//     // };
//     // memo.push(newMemo);
//     // console.log("新しいメモが保存されました:", newMemo);

//     // // 新しいメモをレスポンスとして返す
//     // res.status(201).json({ message: "メモが保存されました", memo: newMemo });
// });

module.exports = router;
