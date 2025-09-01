import { existsSync } from "node:fs";
import { join } from "node:path";
// Importing from @prisma/client; ensure prisma generate has been run for apps/web schema
// Types are intentionally loose to avoid cross-package type friction in PoC
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

function determineDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const abs = join(process.cwd(), "prisma", "dev.db");
  if (existsSync(abs)) return `file:${abs}`;
  // Fallback to repo root path (monorepo run from root)
  const alt = join(process.cwd(), "apps", "web", "prisma", "dev.db");
  return `file:${alt}`;
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: { url: determineDatabaseUrl() },
  },
  log: ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} 