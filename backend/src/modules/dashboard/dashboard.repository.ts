import { prisma } from '../../config/prisma';

export class DashboardRepository {
  async getAdminStats() {
    const [totalEvents, totalVendors, totalOrganizers, totalBookings, revenueAggr] = await Promise.all([
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.user.count({
        where: {
          userRoles: { some: { role: { roleName: 'vendor' } } },
          deletedAt: null
        }
      }),
      prisma.user.count({
        where: {
          userRoles: { some: { role: { roleName: 'organizer' } } },
          deletedAt: null
        }
      }),
      prisma.booking.count({ where: { deletedAt: null } }),
      prisma.booking.aggregate({
        where: { payment: { status: 'verified' }, deletedAt: null },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      totalEvents,
      totalVendors,
      totalOrganizers,
      totalBookings,
      totalRevenue: revenueAggr._sum.totalAmount || 0,
    };
  }

  async getOrganizerStats(organizerId: number) {
    const [totalEvents, totalBooths, totalBookings, revenueAggr] = await Promise.all([
      prisma.event.count({
        where: { organizerId, deletedAt: null }
      }),
      prisma.booth.count({
        where: { event: { organizerId }, deletedAt: null }
      }),
      prisma.booking.count({
        where: { event: { organizerId }, deletedAt: null }
      }),
      prisma.booking.aggregate({
        where: { 
          event: { organizerId }, 
          payment: { status: 'verified' }, 
          deletedAt: null 
        },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      totalEvents,
      totalBooths,
      totalBookings,
      totalRevenue: revenueAggr._sum.totalAmount || 0,
    };
  }
}
