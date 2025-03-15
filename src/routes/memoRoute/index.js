const express = require("express");

const getMemosOfBookRoute = require("./getMemosOfBook");
const createMemoRoute = require("./createMemo");
const updateMemoRoute = require("./updateMemo");
const deleteMemoRoute = require("./deleteMemo");
const getUserMemoRoute = require("./getUserMemos");

const router = express.Router();

// 各エンドポイントを統合
router.use(getMemosOfBookRoute);
router.use(createMemoRoute);
router.use(updateMemoRoute);
router.use(deleteMemoRoute);
router.use(getUserMemoRoute);

module.exports = router;
