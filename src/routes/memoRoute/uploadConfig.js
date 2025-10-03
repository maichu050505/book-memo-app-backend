// uploadConfig.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// アップロード先のディレクトリを決定（ここではプロジェクトルートの "uploads" フォルダ）
const uploadDir = path.resolve(__dirname, "..", "..", "..", "uploads");
console.log("Upload directory should be:", uploadDir);

// アップロードディレクトリが存在しなければ作成する
if (!fs.existsSync(uploadDir)) {
  console.log("Creating upload directory:", uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("Upload directory already exists:", uploadDir);
}

// Multer のストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeFilename = `${Date.now()}.${file.originalname.split(".").pop()}`;
    cb(null, safeFilename);
  },
});

// Multer インスタンスの作成
const upload = multer({ storage });

module.exports = { upload, uploadDir };
