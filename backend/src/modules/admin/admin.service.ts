import { prisma } from '../../config/prisma';
import { UserStatus } from '@prisma/client';
import { NotFoundError } from '../../common/errors/AppError';

export class AdminService {
  async getAllEvents(skip: number = 0, take: number = 50) {
    return prisma.event.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: {
          select: { username: true, email: true }
        },
        _count: {
          select: {
            booths: { where: { deletedAt: null } },
            bookings: { where: { deletedAt: null } }
          }
        }
      }
    });
  }

  async getAllUsers(skip: number = 0, take: number = 50) {
    return prisma.user.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      omit: { passwordHash: true },
      include: {
        userRoles: {
          include: { role: true }
        },
        _count: {
          select: {
            organizedEvents: { where: { deletedAt: null } },
            bookings: { where: { deletedAt: null } }
          }
        }
      }
    });
  }

  async updateUserStatus(userId: number, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { userId, deletedAt: null } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return prisma.user.update({
      where: { userId },
      data: { status },
      omit: { passwordHash: true }
    });
  }
}
