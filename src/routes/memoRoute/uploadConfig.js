const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB/枚
    files: 10, // 最大10枚
  },

  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|heic|heif)/i.test(file.mimetype);
    cb(ok ? null : new Error("画像ファイルのみアップロード可能です"), ok);
  },
});

module.exports = { upload };
