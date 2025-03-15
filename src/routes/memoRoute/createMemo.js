const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const prisma = new PrismaClient();

// **`uploads/`ディレクトリを作成**
const uploadDir = path.resolve(__dirname, "..", "..", "uploads"); // 明示的に `backend/uploads/` に指定
console.log("Upload directory should be:", uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log("Creating upload directory:", uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("Upload directory already exists:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer saving file to:", uploadDir); // ここで `src/uploads/` になっていないか確認！
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeFilename = `${Date.now()}.${file.originalname.split(".").pop()}`;
    console.log("Generated filename:", safeFilename);
    cb(null, safeFilename);
  },
});

const upload = multer({ storage });

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
      console.log(`メモ作成リクエスト: bookId=${bookId}, memoText=${memoText}`);
      console.log(`アップロードされたファイル:`, req.files);

      let memoImg = [];
      if (req.files && req.files.length > 0) {
        memoImg = req.files.map((file) => `/uploads/${file.filename}`);
      }

      console.log("保存する画像のパス:", memoImg);

      const newMemo = await prisma.memo.create({
        data: {
          memoText,
          memoImg: memoImg.length > 0 ? memoImg.join("||") : "",
          // ネストしたリレーションで書籍を接続
          book: { connect: { id: Number(bookId) } },
          // ユーザーとのリレーション接続
          user: { connect: { id: Number(userId) } },
        },
      });

      console.log("新規作成されたメモ:", newMemo);
      res.status(201).json({ memo: newMemo });
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

module.exports = { router };
