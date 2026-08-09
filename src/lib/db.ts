import { PrismaClient } from "@prisma/client";

/**
 * Singleton — em dev o hot-reload recria modulos e estouraria o pool
 * de conexoes se instanciassemos o client a cada import.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
