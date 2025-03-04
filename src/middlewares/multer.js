const multer = require("multer");
const path = require("path");

// 一時保存フォルダの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp/"); // 一時フォルダ
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ユニークなファイル名
  },
});

// 画像のみ許可
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("画像ファイルのみアップロード可能です"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
