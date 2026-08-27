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

  async updateUserStatus(userId: number, status: UserStatus, suspendReason?: string) {
    const user = await prisma.user.findUnique({ where: { userId, deletedAt: null } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return prisma.user.update({
      where: { userId },
      data: { 
        status,
        suspendReason: status === 'suspended' ? suspendReason : null
      },
      omit: { passwordHash: true }
    });
  }

  async getAppeals(skip: number = 0, take: number = 50) {
    return prisma.accountAppeal.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, email: true, status: true, suspendReason: true }
        }
      }
    });
  }

  async updateAppealStatus(appealId: number, status: 'approved' | 'rejected', actionedBy: number) {
    const appeal = await prisma.accountAppeal.findUnique({ where: { appealId } });
    if (!appeal) {
      throw new NotFoundError('ไม่พบคำร้องขอปลดแบน');
    }

    if (appeal.status !== 'pending') {
      throw new Error('คำร้องนี้ถูกจัดการไปแล้ว');
    }

    const updatedAppeal = await prisma.accountAppeal.update({
      where: { appealId },
      data: { status, actionedBy }
    });

    if (status === 'approved') {
      await prisma.user.update({
        where: { userId: appeal.userId },
        data: {
          status: 'active',
          suspendReason: null
        }
      });
    }

    return updatedAppeal;
  }
}
