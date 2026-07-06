import { prisma } from '../../config/prisma';

export class RbacService {
  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const result = await prisma.rolePermission.findFirst({
      where: {
        role: {
          userRoles: {
            some: { userId },
          },
        },
        permission: { permissionName },
      },
    });
    return result !== null;
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const result = await prisma.userRole.findFirst({
      where: {
        userId,
        role: { roleName },
      },
    });
    return result !== null;
  }
}