console.log("__dirname is:", __dirname);

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();

// jsonwebtoken
// bcrypt

// login API
// username, passwordでログイン
// 戻り値としてJWTというトークンをReactに返す
// Reactでは「localStrage」に保存しておく
// JWTを使ってそれぞれのAPIを守る。
// authMiddlewareみたいなミドルウェアをAPIに差し込んでJWTが送られた場合だけ、APIを許可してあげる。

// register API　（ユーザー登録処理）
// username, passwordで登録する。
// passwordはUsersテーブルのpasswordフィールドに保存する。
// passwordはハッシュ化して保存(セキュリティのため、元に戻せない暗号化)
//

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

// 指定された本(bookId)のメモ一覧を取得 (すべて)
// /users/:userId/bookshelf/:bookId/memos
router.get("/users/:userId/bookshelf/:bookId/memos", authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    if (!bookId) {
      return res.status(400).json({ error: "bookId が必要です" });
    }
    const bookIdNumber = Number(bookId);
    if (isNaN(bookIdNumber)) {
      return res.status(400).json({ error: "bookId は数値である必要があります" });
    }

    const memos = await prisma.memo.findMany({
      where: { bookId: bookIdNumber }, // `bookId` を `Number` に変換
      orderBy: { createdAt: "asc" }, // 古いメモが上に、新しいメモが下に表示
    });

    console.log("取得したメモ:", JSON.stringify(memos, null, 2));
    res.json({ memos });
  } catch (error) {
    console.error("メモ取得エラー:", error);
    res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

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

// 特定のメモを更新
router.put(
  "/users/:userId/bookshelf/:bookId/memos/:id",
  authMiddleware,
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

// 特定のメモを削除
router.delete("/users/:userId/bookshelf/:bookId/memos/:id", authMiddleware, async (req, res) => {
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
});

module.exports = router;
