import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean | undefined;
};

function initializeDatabase() {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  // Vercel環境でのデータベース初期化（一度だけ実行）
  if (isProduction && isVercel && !globalForPrisma.dbInitialized) {
    const tmpDbPath = "/tmp/deploy.db";

    try {
      // publicディレクトリからDBをコピー
      if (!existsSync(tmpDbPath)) {
        // Next.jsのpublicディレクトリからDBファイルを取得
        const publicDbPath = join(process.cwd(), "public", "deploy.db");

        if (existsSync(publicDbPath)) {
          console.log("Copying database from public directory to /tmp...");
          const dbContent = readFileSync(publicDbPath);
          writeFileSync(tmpDbPath, dbContent);
          console.log("Database copied successfully");
        } else {
          console.warn("Database file not found in public directory");
        }
      }

      globalForPrisma.dbInitialized = true;
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  // Determine database URL
  let databaseUrl: string;
  
  if (isProduction && isVercel) {
    databaseUrl = "file:/tmp/deploy.db";
  } else if (process.env.DATABASE_URL) {
    databaseUrl = process.env.DATABASE_URL;
  } else {
    // Fallback for build time when DATABASE_URL might not be set
    databaseUrl = "file:./packages/database/dev.db";
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? initializeDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export * from "@prisma/client";
