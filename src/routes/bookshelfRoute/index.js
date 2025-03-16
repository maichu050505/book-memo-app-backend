const express = require("express");

const addToBookshelf = require("./addToBookshelf");
const deleteFromBookshelf = require("./deleteFromBookshelf");
const getUserBookshelf = require("./getUserBookshelf");
const countBookshelf = require("./countBookshelf");

const router = express.Router();

// 各エンドポイントを統合
router.use(addToBookshelf);
router.use(deleteFromBookshelf);
router.use(getUserBookshelf);
router.use(countBookshelf);

module.exports = router;
