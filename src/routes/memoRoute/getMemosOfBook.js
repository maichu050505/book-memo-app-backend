const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

function toAbsolute(url) {
  if (!url) return null;
  // すでに http(s) ならそのまま
  if (/^https?:\/\//i.test(url)) return url;

  // 相対パス（/uploads/... など）はバックエンドの公開URLで前置
  const base = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

// 特定の本に紐づくメモを取得するエンドポイント
router.get("/books/:bookId/memos", async (req, res) => {
  const { bookId } = req.params;

  try {
    const memos = await prisma.memo.findMany({
      where: { bookId: Number(bookId) },
      orderBy: { id: "desc" },
    });

    const shaped = memos.map((m) => {
      const parts = m.memoImg ? m.memoImg.split("||").filter(Boolean) : [];
      const imageUrls = parts.map((p) => toAbsolute(p)).filter(Boolean);
      return { ...m, imageUrls }; // ← フロントはこれを使う
    });

    return res.json(shaped);
  } catch (error) {
    console.error("メモ取得エラー:", error);
    return res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

module.exports = router;
