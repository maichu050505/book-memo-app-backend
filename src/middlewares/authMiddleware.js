const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// 開発時のみシークレットキーをログ出力（本番環境では削除または条件分岐する）
if (process.env.NODE_ENV !== "production") {
  console.log("authMiddleware - JWT_SECRET:", JWT_SECRET);
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "認証トークンが見つかりません" });
  }

  const token = authHeader.split(" ")[1];
  if (process.env.NODE_ENV !== "production") {
    console.log("authMiddleware - Received token:", token);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded にはユーザー情報が含まれている（例: id, username）
    next();
  } catch (error) {
    console.error("authMiddleware - トークン検証エラー:", error);
    return res.status(401).json({ error: "認証トークンが無効です" });
  }
};

module.exports = authMiddleware;
