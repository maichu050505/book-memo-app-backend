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

/** 公開URLから Storage のパスを取り出す */
function publicUrlToStoragePath(publicUrl) {
  // 例: https://<proj>.supabase.co/storage/v1/object/public/memo-images/users/123/1690000-img.jpg
  // → memo-images/users/123/1690000-img.jpg
  try {
    const u = new URL(publicUrl);
    const idx = u.pathname.indexOf("/storage/v1/object/public/");
    if (idx === -1) return null;
    const after = u.pathname.slice(idx + "/storage/v1/object/public/".length);
    return decodeURIComponent(after.startsWith("/") ? after.slice(1) : after);
  } catch {
    return null;
  }
}

function toSafeJpegName(originalName = "image") {
  const base = originalName.replace(/\.[^.]+$/, "");
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .slice(0, 50) || "img";
  return `${Date.now()}-${slug}.jpg`;
}

// 特定のメモを更新
router.put(
  "/users/:userId/bookshelf/:bookId/memos/:id",
  authMiddleware,
  upload.array("memoImg", 5),
  async (req, res) => {
    try {
      const { id, bookId } = req.params;
      const paramUserId = Number(req.params.userId);
      if (Number.isFinite(paramUserId) && paramUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: userId mismatch" });
      }
      const userId = req.user.id;
      const { memoText } = req.body;
      let { deletedImages } = req.body; // 文字列 or 配列で来る想定

      const existingMemo = await prisma.memo.findUnique({ where: { id: Number(id) } });
      if (!existingMemo) {
        return res.status(404).json({ error: "メモが見つかりません" });
      }

      // 既存のURL配列（'||'区切り）
      let memoImg = existingMemo.memoImg ? existingMemo.memoImg.split("||") : [];

      // **削除する画像があれば処理**
      if (deletedImages) {
        if (!Array.isArray(deletedImages)) deletedImages = [deletedImages];

        // DB からも除外
        memoImg = memoImg.filter((img) => !deletedImages.includes(img));

        // Storage からも削除（公開URL→パスに変換）
        const pathsToRemove = deletedImages
          .map((url) => publicUrlToStoragePath(url))
          .filter(Boolean)
          // バケット名を含む形に統一（memo-images/...）
          .map((p) => (p.startsWith(`${BUCKET}/`) ? p : `${BUCKET}/${p}`));

        if (pathsToRemove.length) {
          const { error: removeErr } = await supabase.storage.remove(pathsToRemove);
          if (removeErr) {
            console.error("Storage remove error:", removeErr);
            // 削除に失敗してもDB更新は続けるか、ここで返すかはお好みで
          }
        }
      }

      // --- 追加画像（すべてJPEGに統一）---
      if (req.files && req.files.length > 0) {
        const newUrls = [];
        for (const file of req.files) {
          const jpegBuf = await sharp(file.buffer).jpeg({ quality: 85 }).toBuffer();
          const filename = toSafeJpegName(file.originalname);
          const pathInBucket = `users/${userId}/${filename}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(pathInBucket, jpegBuf, {
              contentType: "image/jpeg",
              upsert: false,
            });
          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return res.status(500).json({ error: "画像の保存に失敗しました" });
          }

          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(pathInBucket);
          newUrls.push(pub.publicUrl);
        }
        memoImg = [...memoImg, ...newUrls];
      }

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
