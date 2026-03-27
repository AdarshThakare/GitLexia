import { env } from "@/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prismaChatV2: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prismaChatV2 ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prismaChatV2 = db;
