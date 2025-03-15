const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// register API　（ユーザー登録処理）
// username, passwordで登録する。
// passwordはUsersテーブルのpasswordフィールドに保存する。
// passwordはハッシュ化して保存(セキュリティのため、元に戻せない暗号化)

// 会員登録 エンドポイント
// POST リクエストで /register エンドポイントに対して、リクエストボディから username、password、passwordConfirm を受け取り、以下の処理を行います。
// 1, 入力チェック（必須フィールドの確認、パスワード一致の検証）
// 2, 既に同じ username が存在しないかの確認
// 3, bcrypt を使ってパスワードをハッシュ化
// 4, 新規ユーザーの作成（Users テーブルに保存）
// 5, 登録成功時は、ユーザーの基本情報（ID と username）を返す

router.post("/register", async (req, res) => {
  const { username, password, passwordConfirm } = req.body;

  // 必須項目のチェック
  if (!username || !password || !passwordConfirm) {
    return res.status(400).json({ error: "全てのフィールドを入力してください" });
  }

  // パスワード確認の一致チェック
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: "パスワードが一致しません" });
  }

  try {
    // 同じ username のユーザーが存在しないかチェック
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "このニックネームは既に使用されています" });
    }

    // パスワードのハッシュ化（saltRoundsは10を使用）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // ユーザー作成後に本棚レコードを upsert で作成または更新（存在しない場合のみ作成）
    await prisma.bookshelf.upsert({
      where: { userId: newUser.id },
      update: {},
      create: { userId: newUser.id },
    });

    res.status(201).json({
      message: "ユーザー登録に成功しました",
      user: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    res.status(500).json({ error: "サーバー内部エラーが発生しました" });
  }
});

module.exports = router;
