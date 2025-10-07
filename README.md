# 本棚メモアプリ Backend

このリポジトリは [本棚メモアプリ](https://github.com/maichu050505/book-memo-app-front) のバックエンドです。
Node.js / Express / Prisma / Supabase を使用しており、書籍に紐づくメモ・レビュー（テキスト＋画像）を管理する API を提供します。

## 主な機能

- ユーザー認証（JWT）
- 書籍に紐づくメモ・レビュー（テキスト＋画像）の登録・編集・削除
- Supabase Storage への画像保存

## 使用技術

- Node.js / Express
- Prisma（PostgreSQL）
- Supabase（Storage）
- Multer + Sharp（画像アップロード・変換）

## セットアップ

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 注意事項

- `.env` の `SUPABASE_SERVICE_ROLE_KEY` は公開しない。
