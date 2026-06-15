import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let dbReachableCache: boolean | null = null;

const DB_PROBE_MS = 1500;

export async function isDatabaseReachable(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  if (dbReachableCache !== null) return dbReachableCache;

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), DB_PROBE_MS)
      ),
    ]);
    dbReachableCache = true;
  } catch {
    dbReachableCache = false;
  }

  return dbReachableCache;
}

/** Chame após subir o Postgres para reconectar sem reiniciar o dev server. */
export function resetDatabaseReachableCache(): void {
  dbReachableCache = null;
}
