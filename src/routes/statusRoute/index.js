const express = require("express");

const getStatus = require("./getStatus");
const updateStatus = require("./updateStatus");

const router = express.Router();

// 各エンドポイントを統合
router.use(getStatus);
router.use(updateStatus);

module.exports = router;
