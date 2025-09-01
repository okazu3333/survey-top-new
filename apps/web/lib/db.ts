import { PrismaClient } from "@prisma/client";
import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  // If explicitly set and not targeting /tmp, honor it (local/dev)
  if (envUrl && !envUrl.includes("/tmp/deploy.db")) return envUrl;

  // Vercel or environments expecting /tmp storage
  const tmpPath = "/tmp/deploy.db";
  const bundledPath = join(process.cwd(), "public", "deploy.db");

  try {
    if (!existsSync(tmpPath) && existsSync(bundledPath)) {
      copyFileSync(bundledPath, tmpPath);
    }
  } catch {
    // noop - fall through; Prisma will still attempt connection
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