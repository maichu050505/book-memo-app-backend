const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const bookRoute = require("./routes/bookRoute");

app.use("/books", bookRoute);

app.listen(3000, () => {
    console.log("実行されました");
});