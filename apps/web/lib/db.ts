import { PrismaClient } from "@prisma/client";
import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) return envUrl;

  const tmpPath = "/tmp/deploy.db";
  const bundledPrismaPath = join(process.cwd(), "prisma", "deploy.db");
  const bundledPublicPath = join(process.cwd(), "public", "deploy.db");

  try {
    // Always try to refresh /tmp from bundled DB to avoid empty/stale files
    if (existsSync(bundledPrismaPath)) {
      copyFileSync(bundledPrismaPath, tmpPath);
      if (process.env.NODE_ENV === "production") console.error("DB init: refreshed from prisma/deploy.db");
    } else if (existsSync(bundledPublicPath)) {
      copyFileSync(bundledPublicPath, tmpPath);
      if (process.env.NODE_ENV === "production") console.error("DB init: refreshed from public/deploy.db");
    } else {
      if (process.env.NODE_ENV === "production") console.error("DB init: bundled DB not found");
    }
  } catch (e) {
    if (process.env.NODE_ENV === "production") console.error("DB init error:", e);
  }

  return `file:${tmpPath}`;
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolveDatabaseUrl() },
    },
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 