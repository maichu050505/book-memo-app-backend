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
  allowedHeaders: ["Content-Type", "Authorization"], // Authorization ヘッダーを許可
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
