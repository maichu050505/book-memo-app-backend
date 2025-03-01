const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "認証トークンが見つかりません" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded にはペイロードが含まれている（例: id, username）
    next();
  } catch (error) {
    return res.status(401).json({ error: "認証トークンが無効です" });
  }
};

module.exports = authMiddleware;
