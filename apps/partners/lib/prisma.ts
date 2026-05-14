import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { partnersPrisma?: PrismaClient };

export const prisma = globalForPrisma.partnersPrisma ?? new PrismaClient({
  log: process.env.PRISMA_QUERY_LOGS === "1" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.partnersPrisma = prisma;
}
