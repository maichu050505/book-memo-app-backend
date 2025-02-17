const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const app = express();

// CORS 設定
const corsOptions = {
  origin: "http://localhost:5173", // フロントエンドのURL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type"],
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
const bookshelfRoute = require("./routes/bookshelfRoute");
const getBookInfoByIdRoute = require("./routes/getBookInfoByIdRoute");
const reviewRoute = require("./routes/reviewRoute");
const memoRoute = require("./routes/memoRoute.js");
const bookRoute = require("./routes/booksRoute");

// ルートの設定
app.use("", searchRoute);
app.use("", bookshelfRoute);
app.use("", getBookInfoByIdRoute);
app.use("/books", reviewRoute);
app.use("", memoRoute);
app.use("", bookRoute);

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で実行されました`);
});
