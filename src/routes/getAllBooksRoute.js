const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// 全ての本を取得するエンドポイント (GET /books)
router.get("/books", async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json({ books });
  } catch (error) {
    console.error("本の取得エラー:", error);
    res.status(500).json({ error: "本の取得に失敗しました" });
  }
});
module.exports = router;
