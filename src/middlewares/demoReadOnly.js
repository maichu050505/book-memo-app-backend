const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * デモユーザーの書き込みを403でブロック
 * - 本番のみ有効（NODE_ENV=production）
 * - req.user.id が authMiddleware でセットされている前提
 */
module.exports = async function demoReadOnly(req, res, next) {
  try {
    // 環境変数が false なら何もしない
    if (process.env.DEMO_READONLY === "false") return next();

    const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (process.env.NODE_ENV !== "production" || !isWrite) return next();

    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isDemo: true },
    });

    if (user?.isDemo) {
      return res.status(403).json({ error: "Demo user is read-only" });
    }
    next();
  } catch (e) {
    next(e);
  }
};
