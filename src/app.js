require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const app = express();

// 健康チェック（Render の Health Check 用）
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

// （任意）ルートアクセスも 200 を返す
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// CORS 設定
const whitelist = ["http://localhost:5173", "https://book-memo-app-front.vercel.app"];

const corsOptions = {
  origin: function (origin, callback) {
    // オリジンがない場合（同一オリジンリクエストなど）は許可する
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// JSON のサイズ制限
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// 静的ファイル（アップロードされた画像）の公開
console.log("Serving static files from:", path.resolve(__dirname, "../uploads"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads"))); // `backend/uploads/` に統一

// ルートのインポート
const searchRoute = require("./routes/searchRoute");
const bookshelfRoutes = require("./routes/bookshelfRoute");
const getBookInfoByIdRoute = require("./routes/getBookInfoByIdRoute");
const reviewRoutes = require("./routes/reviewRoute");
const memoRoutes = require("./routes/memoRoute");
const statusRoutes = require("./routes/statusRoute");
const registerRoute = require("./routes/registerRoute");
const loginRoute = require("./routes/loginRoute");
const getAllBooksRoute = require("./routes/getAllBooksRoute");

// ルートの設定
app.use("", searchRoute);
app.use("", bookshelfRoutes);
app.use("", getBookInfoByIdRoute);
app.use("", reviewRoutes);
app.use("", memoRoutes);
app.use("", statusRoutes);
app.use("", registerRoute);
app.use("", loginRoute);
app.use("", getAllBooksRoute);

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で実行されました`);
});

// すべての GET リクエストに対して index.html を返す（開発時のみ）
if (process.env.NODE_ENV !== "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../index.html"));
  });
}

app.use((err, req, res, next) => {
  // Multerのファイルサイズ超過など
  if (err && err.name === "MulterError") {
    // 例: 'LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT'
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  if (err && /画像ファイルのみアップロード可能/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
