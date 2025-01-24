const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const searchRoute = require("./routes/searchRoute");
const bookshelfRoute = require("./routes/bookshelfRoute");
const getBookInfoByIdRoute = require("./routes/getBookInfoByIdRoute");
const reviewRoute = require("./routes/reviewRoute");
const memoRoute = require("./routes/memoRoute.js");

app.use("/books", searchRoute);
app.use("/books", bookshelfRoute);
app.use("/books", getBookInfoByIdRoute);
app.use("/books", reviewRoute);
app.use("/books", memoRoute);

app.listen(3000, () => {
    console.log("実行されました");
});