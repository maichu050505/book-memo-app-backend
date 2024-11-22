const express = require("express");

const router = express.Router();

const books = [];

router.get("/serach", (req, res) => {
    const params = req.query;

    const title = params.title;

    const result = books.filter((book) => {
        return book.title.includes(title);
    });
    res.json(result);
})

module.exports = router;