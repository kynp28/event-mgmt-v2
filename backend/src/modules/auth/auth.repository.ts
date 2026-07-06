import { prisma } from '../../config/prisma';
import { User } from '@prisma/client';

// Repository Layer: รับผิดชอบแค่การคุยกับฐานข้อมูลเท่านั้น
// ไม่มี business logic ใดๆ อยู่ในชั้นนี้ — แค่ query/insert/update ตรงไปตรงมา
export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findUserById(userId: number): Promise<User | null> {
    return prisma.user.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        status: 'active',
      },
    });
  }

  async assignRole(userId: number, roleName: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { roleName } });
    if (!role) {
      throw new Error(`Role "${roleName}" ไม่มีอยู่ในระบบ — ต้อง seed ข้อมูลก่อน`);
    }
    await prisma.userRole.create({
      data: { userId, roleId: role.roleId },
    });
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.roleName);
  }
}