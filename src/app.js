const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client"); // PrismaClientをインポート

const prisma = new PrismaClient(); // prismaのインスタンスを作成
const app = express();

app.use(bodyParser.json());
app.use(cors());

const searchRoute = require("./routes/searchRoute");
const bookshelfRoute = require("./routes/bookshelfRoute");
const getBookInfoByIdRoute = require("./routes/getBookInfoByIdRoute");
const reviewRoute = require("./routes/reviewRoute");
const memoRoute = require("./routes/memoRoute.js");
const bookRoute = require("./routes/booksRoute");

app.use("", searchRoute);
app.use("", bookshelfRoute);
app.use("", getBookInfoByIdRoute);
app.use("/books", reviewRoute);
app.use("", memoRoute);
app.use("", bookRoute);

app.listen(3000, async () => {
    console.log("実行されました");
});