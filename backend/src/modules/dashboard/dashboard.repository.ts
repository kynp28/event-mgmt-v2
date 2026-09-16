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
      totalRevenue: Number(revenueAggr._sum.totalAmount || 0),
    };
  }

  async getOrganizerStats(organizerId: number) {
    const [totalEvents, totalBooths, bookedBooths, activeEvents, pendingBookings, revenueAggr, upcomingEvents, recentBookings] = await Promise.all([
      prisma.event.count({ where: { organizerId, deletedAt: null } }),
      prisma.booth.count({ where: { event: { organizerId }, deletedAt: null } }),
      prisma.booth.count({ where: { event: { organizerId }, status: 'booked', deletedAt: null } }),
      prisma.event.count({ where: { organizerId, eventStatus: 'open', deletedAt: null } }),
      prisma.booking.count({ where: { event: { organizerId }, payment: { status: 'pending' }, deletedAt: null } }),
      prisma.booking.aggregate({
        where: { event: { organizerId }, payment: { status: 'verified' }, deletedAt: null },
        _sum: { totalAmount: true }
      }),
      prisma.event.findMany({
        where: { organizerId, deletedAt: null },
        select: { 
          eventId: true, eventName: true, startDate: true, endDate: true, eventStatus: true,
          _count: { select: { booths: true } },
          booths: { where: { status: 'booked' } }
        },
        orderBy: { startDate: 'asc' },
        take: 3
      }),
      prisma.booking.findMany({
        where: { event: { organizerId }, deletedAt: null },
        include: { vendor: true, event: true, booth: true, payment: true },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ]);

    // Format upcoming events for the UI (calculate occupancy)
    const formattedUpcoming = upcomingEvents.map(e => ({
      eventId: e.eventId,
      eventName: e.eventName,
      date: e.startDate,
      occupancy: e._count.booths > 0 ? Math.round((e.booths.length / e._count.booths) * 100) : 0,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80' // Mock image for now
    }));

    // Format recent bookings
    const formattedRecent = recentBookings.map(b => ({
      bookingId: b.bookingId,
      vendorName: b.vendor.username,
      eventName: b.event.eventName,
      booths: b.booth.boothNo,
      status: b.payment?.status || 'pending',
      amount: Number(b.totalAmount)
    }));

    // Mock daily sales for the chart
    const dailySales = [
      { date: 'จ', value: 18 }, { date: 'อ', value: 26 }, { date: 'พ', value: 22 }, 
      { date: 'พฤ', value: 34 }, { date: 'ศ', value: 48 }, { date: 'ส', value: 41 }, { date: 'อา', value: 29 }
    ];

    return {
      totalEvents,
      totalBooths,
      bookedBooths,
      activeEvents,
      pendingBookings,
      totalRevenue: Number(revenueAggr._sum.totalAmount || 0),
      upcomingEvents: formattedUpcoming,
      recentBookings: formattedRecent,
      dailySales
    };
  }
}
