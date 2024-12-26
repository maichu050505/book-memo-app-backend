const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const searchRoute = require("./routes/searchRoute");
const bookshelfRoute = require("./routes/bookshelfRoute");
const getBookInfoRoute = require("./routes/getBookInfoRoute");

app.use("/books", searchRoute);
app.use("/books", bookshelfRoute);
app.use("/books", getBookInfoRoute);

app.listen(3000, () => {
    console.log("実行されました");
});