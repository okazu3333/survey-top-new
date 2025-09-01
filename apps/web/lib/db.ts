import { PrismaClient } from "@prisma/client";
import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.includes("/tmp/deploy.db")) return envUrl;

  const tmpPath = "/tmp/deploy.db";
  const bundledPrismaPath = join(process.cwd(), "prisma", "deploy.db");
  const bundledPublicPath = join(process.cwd(), "public", "deploy.db");

  try {
    if (!existsSync(tmpPath)) {
      if (existsSync(bundledPrismaPath)) {
        copyFileSync(bundledPrismaPath, tmpPath);
      } else if (existsSync(bundledPublicPath)) {
        copyFileSync(bundledPublicPath, tmpPath);
      }
    }
  } catch {
    // ignore
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