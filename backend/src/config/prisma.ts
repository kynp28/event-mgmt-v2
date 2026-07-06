import { PrismaClient } from '@prisma/client';

// ใช้ global เพื่อป้องกันการสร้าง PrismaClient หลายตัวตอน hot-reload ใน dev mode
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma = global.prismaInstance ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}