import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl(): string {
  const accelUrl = process.env.PRISMA_DATABASE_URL;
  if (accelUrl) return accelUrl;
  const directUrl = process.env.DATABASE_URL;
  if (directUrl) return directUrl;
  throw new Error("DATABASE_URL or PRISMA_DATABASE_URL is required");
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