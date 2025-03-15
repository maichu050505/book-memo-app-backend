const express = require("express");

const { router: getMemosOfBookRoute } = require("./getMemosOfBook");
const { router: createMemoRoute } = require("./createMemo");
const { router: updateMemoRoute } = require("./updateMemo");
const { router: deleteMemoRoute } = require("./deleteMemo");

const router = express.Router();

// 各エンドポイントを統合
router.use(getMemosOfBookRoute);
router.use(createMemoRoute);
router.use(updateMemoRoute);
router.use(deleteMemoRoute);

module.exports = router;
