// jsonwebtoken
// bcrypt

// login API
// username, passwordでログイン
// 戻り値としてJWTというトークンをReactに返す
// Reactでは「localStrage」に保存しておく
// JWTを使ってそれぞれのAPIを守る。
// authMiddlewareみたいなミドルウェアをAPIに差し込んでJWTが送られた場合だけ、APIを許可してあげる。

// routes/loginRoute.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// JWT のシークレットキー（環境変数から取得するのが望ましい）
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// 開発時のみシークレットキーをログ出力（本番環境では削除または条件分岐する）
if (process.env.NODE_ENV !== "production") {
  console.log("loginRoute - JWT_SECRET:", JWT_SECRET);
}

// ログインエンドポイント
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 入力チェック
  if (!username || !password) {
    return res.status(400).json({ error: "ニックネームとパスワードを入力してください" });
  }

  try {
    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, password: true, isDemo: true },
    });
    if (!user) {
      return res.status(401).json({ error: "認証に失敗しました" });
    }

    // パスワードの照合
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "認証に失敗しました" });
    }

    // ★ JWT の生成 isDemo を含める
    // ペイロードには必要に応じたユーザー情報を含める（ここでは user.id と username）
    const payload = { id: user.id, username: user.username, isDemo: !!user.isDemo };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // JWT を返す
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isDemo: !!user.isDemo,
      },
    });
  } catch (error) {
    console.error("ログインエラー:", error);
    res.status(500).json({ error: "サーバー内部エラーが発生しました" });
  }
});

module.exports = router;
