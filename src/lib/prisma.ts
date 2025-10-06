// src/lib/prisma.ts

import { PrismaClient } from '../generated/prisma'; // Use o caminho que você definiu

// Cria uma única instância do Prisma Client
// Isso é crucial para evitar que o Next.js crie novas instâncias a cada 'hot reload'
const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Usa a instância global em desenvolvimento (para hot reload) ou cria uma nova em produção
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;