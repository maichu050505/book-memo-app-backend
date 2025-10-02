const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const demoReadOnly = require("../../middlewares/demoReadOnly");
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

// 特定のメモを削除
router.delete(
  "/users/:userId/bookshelf/:bookId/memos/:id",
  authMiddleware,
  demoReadOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      // 本人以外の削除を禁止（保険）
      const paramUserId = Number(req.params.userId);
      if (Number.isFinite(paramUserId) && paramUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: userId mismatch" });
      }

      // メモが存在するか確認
      const existingMemo = await prisma.memo.findUnique({ where: { id: Number(id) } });
      if (!existingMemo) {
        return res.status(404).json({ error: "メモが見つかりません" });
      }

      // 画像の削除（Storage）
      if (existingMemo.memoImg) {
        const urls = existingMemo.memoImg.split("||").filter(Boolean);

        // Supabase Storage のパスに変換（外部URLはスキップ）
        const pathsToRemove = urls
          .map((url) => publicUrlToStoragePath(url))
          .filter(Boolean)
          .map((p) => (p.startsWith(`${BUCKET}/`) ? p : `${BUCKET}/${p}`));

        if (pathsToRemove.length) {
          const { error: removeErr } = await supabase.storage.remove(pathsToRemove);
          if (removeErr) {
            console.error("Storage remove error:", removeErr);
          }
        }
      }

      // メモ本体削除
      await prisma.memo.delete({ where: { id: Number(id) } });

      console.log(`メモ削除成功: ID=${id}`);
      return res.json({ message: "メモを削除しました" });
    } catch (error) {
      console.error("メモ削除エラー:", error);
      return res.status(500).json({ error: "メモの削除に失敗しました" });
    }
  }
);

module.exports = router;
