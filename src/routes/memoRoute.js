const express = require("express");
const router = express.Router();

// 仮のデータベース
const { books, memo } = require("../database");

// 指定された本のメモを取得 (すべて)
router.get("/memos/:bookId", (req, res) => {
  const { bookId } = req.params;

  // 対応するメモをフィルタリング
  const bookMemos = memo.filter((m) => m.bookId == bookId);
  if (bookMemos.length === 0) {
    return res.status(200).json({ memos: [] }); // 空のメモを返す
  }

  res.status(200).json({ memos: bookMemos });
});

// 新しいメモを追加
router.post("/memos/:bookId", (req, res) => {
  const { bookId } = req.params;
  const { memoText, memoImg } = req.body;

  // 本が存在するか確認
  const bookExists = books.some((b) => b.id.toString() == bookId);
  if (!bookExists) {
    return res.status(404).json({ error: "指定された本が見つかりません" });
  }

  // 新しいメモを追加
  const newMemo = {
    bookId,
    memoText,
    memoImg,
    memoId: Date.now(), // 一意のIDを生成
  };
  memo.push(newMemo);
  console.log("新しいメモが保存されました:", newMemo);

  // 新しいメモをレスポンスとして返す
  res.status(201).json({ message: "メモが保存されました", memo: newMemo });
});

// 特定のメモを更新
router.put("/memos/:bookId", (req, res) => {
  const { bookId } = req.params; // URLパラメータから取得
  const { memoText, memoImg, memoId } = req.body; // リクエストボディから取得
  console.log("PUTリクエストを受信:", { bookId, memoText, memoImg, memoId });

  // 対象のメモを検索
  const memoIndex = memo.findIndex((m) => m.bookId == bookId && m.memoId == memoId);
  if (memoIndex === -1) {
    console.error("メモが見つかりません:", { bookId, memoId });
    return res.status(404).json({ error: "メモが見つかりません" });
  }

  // メモを更新
  memo[memoIndex] = { bookId, memoText, memoImg, memoId };
  console.log("更新されたメモ:", memo[memoIndex]);
  res.status(200).json({ message: "メモが更新されました", memo: memo[memoIndex] });
});

// 特定のメモを削除
router.delete("/memos/:bookId/:memoId", (req, res) => {
  const { bookId, memoId } = req.params;

  console.log(`削除リクエストを受信 (bookId=${bookId}, memoId=${memoId})`);

  // 対象のメモを検索
  const memoIndex = memo.findIndex((m) => m.bookId == bookId && m.memoId == Number(memoId));
  
  if (memoIndex === -1) {
    console.error(`削除対象のメモが見つかりません (bookId=${bookId}, memoId=${memoId})`);
    return res.status(404).json({ error: "メモが見つかりません" });
  }

  // メモを削除
  const deletedMemo = memo.splice(memoIndex, 1); // 該当メモを配列から削除
  console.log(`メモが削除されました:`, deletedMemo);

  res.status(200).json({ message: "メモが削除されました", deletedMemo });
});


// 全メモ一覧を確認 (デバッグ用)　http://localhost:3000/books/memos
router.get("/memos", (req, res) => {
  res.status(200).json({ memos: memo });
});

module.exports = router;

// サーバー直接実行用コード
if (require.main === module) {
  const express = require("express");
  const app = express();

  app.use(express.json()); // JSONパースを有効化
  app.use("/books", router);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
