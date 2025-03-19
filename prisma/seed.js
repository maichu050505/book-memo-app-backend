// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 既に書籍データが存在するかチェックする
  const existingBooks = await prisma.book.findMany();
  if (existingBooks.length > 0) {
    console.log("既に書籍データが存在するため、Seed をスキップします。");
    return;
  }
  // 10件の書籍データを登録する
  const book1 = await prisma.book.create({
    data: {
      title: "モダンJavaScriptの基本から始める React実践の教科書",
      author: "じゃけぇ（岡田拓巳）",
      publisher: "SBクリエイティブ",
      publishedDate: new Date("2021-09-16"),
      coverImageUrl: "img/cover1.jpg",
      amazonLink: "https://amzn.asia/d/cr7hVjL",
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: "いちばんやさしいGit&GitHubの教本 第2版 人気講師が教えるバージョン管理&共有入門",
      author: "横田紋奈, 宇賀神みずき",
      publisher: "インプレス",
      publishedDate: new Date("2022-03-17"),
      coverImageUrl: "img/cover2.jpg",
      amazonLink: "https://amzn.asia/d/eRqAg6g",
    },
  });

  const book3 = await prisma.book.create({
    data: {
      title: "SQL 第2版: ゼロからはじめるデータベース操作",
      author: "ミック",
      publisher: "翔泳社",
      publishedDate: new Date("2016-06-01"),
      coverImageUrl: "img/cover3.jpg",
      amazonLink: "https://amzn.asia/d/eRARGG2",
    },
  });

  const book4 = await prisma.book.create({
    data: {
      title: "スラスラわかるJavaScript 新版",
      author: "桜庭洋之, 望月幸太郎",
      publisher: "翔泳社",
      publishedDate: new Date("2022-07-13"),
      coverImageUrl: "img/cover4.jpg",
      amazonLink: "https://amzn.asia/d/5HIJwPh",
    },
  });

  const book5 = await prisma.book.create({
    data: {
      title: "プロの「引き出し」を増やす　HTML+CSSコーディングの強化書　改訂2版",
      author: "草野あけみ",
      publisher: "エムディエヌコーポレーション",
      publishedDate: new Date("2021-11-29"),
      coverImageUrl: "img/cover5.jpg",
      amazonLink: "https://amzn.asia/d/ag5geAB",
    },
  });

  const book6 = await prisma.book.create({
    data: {
      title: "これだけで基本がしっかり身につく HTML/CSS&Webデザイン1冊目の本",
      author: "Capybara Design, 竹内直人, 竹内瑠美",
      publisher: "翔泳社",
      publishedDate: new Date("2021-10-14"),
      coverImageUrl: "img/cover6.jpg",
      amazonLink: "https://amzn.asia/d/0rT6vDF",
    },
  });

  const book7 = await prisma.book.create({
    data: {
      title: "【改訂第3版】WordPress 仕事の現場でサッと使える！ デザイン教科書",
      author: "中島真洋, ロクナナワークショップ",
      publisher: "技術評論社",
      publishedDate: new Date("2023-06-23"),
      coverImageUrl: "img/cover7.jpg",
      amazonLink: "https://amzn.asia/d/d5AnGXW",
    },
  });

  const book8 = await prisma.book.create({
    data: {
      title: "ジンドゥークリエイター 仕事の現場で使える! カスタマイズとデザイン教科書",
      author: "服部雄樹, 浅木輝美, 神森勉, KDDIウェブコミュニケーションズ",
      publisher: "技術評論社",
      publishedDate: new Date("2020-01-20"),
      coverImageUrl: "img/cover8.jpg",
      amazonLink: "https://amzn.asia/d/8LB3F86",
    },
  });

  const book9 = await prisma.book.create({
    data: {
      title: "ほんの一手間で劇的に変わるHTML & CSSとWebデザイン実践講座",
      author: "Mana",
      publisher: "SBクリエイティブ",
      publishedDate: new Date("2021-02-20"),
      coverImageUrl: "img/cover9.jpg",
      amazonLink: "https://amzn.asia/d/3BJ74BZ",
    },
  });

  const book10 = await prisma.book.create({
    data: {
      title: "家を買うときに「お金で損したくない人」が読む本",
      author: "千日太郎",
      publisher: "日本実業出版社",
      publishedDate: new Date("2018-01-31"),
      coverImageUrl: "img/cover10.jpg",
      amazonLink: "https://amzn.asia/d/fYCMmEU",
    },
  });

  console.log("初期書籍データを登録しました:");
  console.log({ book1, book2, book3, book4, book5, book6, book7, book8, book9, book10 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
