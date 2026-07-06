import { prisma } from '../../config/prisma';

export class AdminService {
  async getAllEvents() {
    return prisma.event.findMany({
      where: { deletedAt: null },
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

  async getAllUsers() {
    return prisma.user.findMany({
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
}
