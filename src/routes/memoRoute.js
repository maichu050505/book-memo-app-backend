console.log("__dirname is:", __dirname);

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");

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

// 指定された本のメモを取得 (すべて)
router.get("/memos/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    console.log(`取得リクエスト: /memos/${bookId}, 型: ${typeof bookId}`);

    if (!bookId) {
      return res.status(400).json({ error: "bookId が必要です" });
    }

    const bookIdNumber = Number(bookId);
    if (isNaN(bookIdNumber)) {
      return res.status(400).json({ error: "bookId は数値である必要があります" });
    }

    const memos = await prisma.memo.findMany({
      where: { bookId: bookIdNumber }, // `bookId` を `Number` に変換
      orderBy: { createdAt: "desc" },
    });

    console.log("取得したメモ:", JSON.stringify(memos, null, 2));
    res.json({ memos });
  } catch (error) {
    console.error("メモ取得エラー:", error);
    res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

// メモの新規追加
router.post("/memos/:bookId", upload.array("memoImg", 5), async (req, res) => {
  try {
    const { bookId } = req.params;
    const { memoText } = req.body;

    console.log(`メモ作成リクエスト: bookId=${bookId}, memoText=${memoText}`);
    console.log(`アップロードされたファイル:`, req.files);

    let memoImg = [];
    if (req.files && req.files.length > 0) {
      memoImg = req.files.map((file) => `/uploads/${file.filename}`);
    }

    console.log("保存する画像のパス:", memoImg);

    const newMemo = await prisma.memo.create({
      data: {
        bookId: Number(bookId),
        memoText,
        memoImg: memoImg.length > 0 ? memoImg.join("||") : "",
      },
    });

    console.log("新規作成されたメモ:", newMemo);
    res.status(201).json({ memo: newMemo });
  } catch (error) {
    console.error("メモ作成エラー:", error);
    res.status(500).json({ error: "メモの作成に失敗しました" });
  }
});

// router.post("/memos/:bookId", async (req, res) => {
//   console.log("リクエストボディ:", JSON.stringify(req.body).length, "bytes");
//   const { bookId } = req.params;
//   let { memoText, memoImg } = req.body;

//   console.log("リクエストボディ:", req.body);

//   try {
//     const newMemo = await prisma.memo.create({
//       data: {
//         bookId: parseInt(bookId, 10),
//         memoText,
//         memoImg: memoImgUrls.join("||"), // URL を || で保存
//       },
//     });

//     // // `memoImg` を適切に処理する
//     // if (!memoImg) {
//     //   memoImg = ""; // 画像なしの場合は空文字を保存
//     // } else if (Array.isArray(memoImg)) {
//     //   memoImg = memoImg.join("||"); // `||` をデリミタとして使う
//     // } else if (typeof memoImg !== "string") {
//     //   console.error("memoImg の形式が不正です:", memoImg);
//     //   return res.status(400).json({ error: "memoImg の形式が不正です" });
//     // }

//     // console.log("保存する memoImg:", memoImg);

//     // const newMemo = await prisma.memo.create({
//     //   data: {
//     //     bookId: parseInt(bookId, 10),
//     //     memoText,
//     //     memoImg, // `||` 区切りの文字列として保存
//     //   },
//     // });

//   // try {
//   //   const { memoText, memoImg } = req.body;
//   //   const bookId = parseInt(req.params.bookId, 10);
//   //   // req.params.bookId の役割
//   //   // req.params は、ルート（URL）のパラメータ を取得するオブジェクト。
//   //   // 例えば、POST /memos/6 のようなリクエストが来た場合:
//   //   // req.params.bookId は "6"（文字列）になる。
//   //   // parseInt(req.params.bookId, 10) の役割
//   //   // 文字列 "6" を整数 6 に変換する ための処理。
//   //   // parseInt( , 10) の 10 は「10進数として変換する」という指定（通常は 10 を使う）。
//   //   // これにより、bookId は 6（数値型） になる。

//   //   if (!memoText) {
//   //     return res.status(400).json({ error: "メモのテキストが必要です。" });
//   //   }

//   //   let formattedMemoImg = "";
//   //   if (Array.isArray(memoImg)) {
//   //     formattedMemoImg = memoImg.join(","); // 配列をカンマ区切りの文字列に変換
//   //   } else if (typeof memoImg === "string") {
//   //     formattedMemoImg = memoImg; // すでに文字列ならそのまま
//   //   }

//   //   const newMemo = await prisma.memo.create({
//   //     data: {
//   //       bookId,
//   //       memoText,
//   //       memoImg: formattedMemoImg, // データベースに保存
//   //     },
//   //   });

//     res.status(201).json({ message: "メモが追加されました", memo: newMemo });
//   } catch (error) {
//     console.error("メモ追加エラー:", error);
//     res.status(500).json({ error: "メモの追加に失敗しました" });
//   }

//     //仮のデータベースを使っていた時の書き方
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

// router.post("/memos/:bookId", async (req, res) => {
//   console.log("リクエストボディ:", JSON.stringify(req.body).length, "bytes");
//   const { bookId } = req.params;
//   let { memoText, memoImg } = req.body;

//   console.log("リクエストボディ:", req.body);

//   // Prismaを使う時の書き方
//   try {
//     // `memoImg` を適切に処理する
//     if (memoImg === undefined || memoImg === null) {
//       memoImg = ""; // 画像なしの場合は空文字を保存
//     } else if (Array.isArray(memoImg)) {
//       memoImg = memoImg.filter(Boolean).join(","); // 空文字や `null` を除外し、カンマ区切りに変換
//     } else if (typeof memoImg !== "string") {
//       console.error("memoImg の形式が不正です:", memoImg);
//       return res.status(400).json({ error: "memoImg の形式が不正です" });
//     }

//     console.log("保存する memoImg:", memoImg);

//     const newMemo = await prisma.memo.create({
//       data: {
//         bookId: parseInt(bookId),
//         memoText,
//         memoImg, // ここではカンマ区切りの文字列
//       },
//       // data: {
//       //   bookId: parseInt(bookId),
//       //   memoText,
//       //   memoImg: Array.isArray(memoImg) && memoImg.length > 0 ? memoImg : [], //memoImg が 配列であり、かつ空でない場合のみ そのままセット。空の配列 [] なら、そのまま [] を渡す。
//       // },
//     });

//     res.status(201).json({ message: "メモが追加されました", memo: newMemo });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "サーバーエラー" });
//   }

//   // 仮のデータベースを使っていた時の書き方
//   // 本が存在するか確認
//   // const bookExists = books.some((b) => b.id.toString() == bookId);
//   // if (!bookExists) {
//   //   return res.status(404).json({ error: "指定された本が見つかりません" });
//   // }

//   // // 新しいメモを追加
//   // const newMemo = {
//   //   bookId,
//   //   memoText,
//   //   memoImg,
//   //   memoId: Date.now(), // 一意のIDを生成
//   // };
//   // memo.push(newMemo);
//   // console.log("新しいメモが保存されました:", newMemo);

//   // // 新しいメモをレスポンスとして返す
//   // res.status(201).json({ message: "メモが保存されました", memo: newMemo });
// });

// 特定のメモを更新
router.put("/memos/:id", upload.array("memoImg", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { memoText, bookId } = req.body;
    let deletedImages = req.body.deletedImages; // フロントから受け取る

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
});


// router.put("/memos/:memoId", async (req, res) => {
//   const { memoId } = req.params; // URLパラメータから取得
//   const { memoText, memoImg } = req.body; // リクエストボディから取得
//   console.log("PUTリクエストを受信:", { memoText, memoImg, memoId });

//   // Prismaを使う時の書き方
//   try {
//     const updatedMemo = await prisma.memo.update({
//       where: {
//         id: parseInt(memoId), // `id` を使用
//       },
//       // data: { memoText, memoImg },
//       data: {
//         memoText,
//         memoImg: Array.isArray(memoImg) ? memoImg.join(",") : memoImg, // 画像データを文字列に変換
//       },
//     });

//     res.status(200).json({ message: "メモが更新されました", memo: updatedMemo });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "サーバーエラー" });
//   }

//   // 仮のデータベースを使っていた時の書き方
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
router.delete("/memos/:id", async (req, res) => {
  try {
    const memoId = Number(req.params.id); // 🔹 id を Number に変換
    console.log(`🗑 メモ削除リクエスト: ID=${memoId}`);

    // 🔹 メモが存在するか確認
    const existingMemo = await prisma.memo.findUnique({ where: { id: memoId } });

    if (!existingMemo) {
      return res.status(404).json({ error: "メモが見つかりません" });
    }

    // 🔹 画像がある場合、サーバーから削除
    if (existingMemo.memoImg) {
      const imagePaths = existingMemo.memoImg.split("||"); // `||` で複数画像を分割
      imagePaths.forEach((imgPath) => {
        const filePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ 画像削除: ${filePath}`);
        }
      });
    }

    // 🔹 メモ削除
    await prisma.memo.delete({ where: { id: memoId } });

    console.log(`✅ メモ削除成功: ID=${memoId}`);
    res.json({ message: "メモを削除しました" });
  } catch (error) {
    console.error("❌ メモ削除エラー:", error);
    res.status(500).json({ error: "メモの削除に失敗しました" });
  }
});

// 全メモ一覧を確認 (デバッグ用)　http://localhost:3000/books/memos
router.get("/memos", (req, res) => {
  res.status(200).json({ memos: memo });
});

module.exports = router;

// サーバー直接実行用コード
if (require.main === module) {
  const express = require("express");
  const app = express();

  app.use(express.json()); // JSONパースを有効化
  app.use("/books", router);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
