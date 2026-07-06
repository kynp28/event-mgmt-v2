import { prisma } from '../../config/prisma';
import { Booking, BookingStatus } from '@prisma/client';
import { ConflictError } from '../../common/errors/AppError';

export class BookingRepository {
  async createBookingWithTransaction(
    vendorId: number, 
    eventId: number, 
    boothId: number, 
    totalAmount: number
  ): Promise<Booking> {
    return prisma.$transaction(async (tx) => {
      // เช็คสถานะบูธภายใน transaction เพื่อป้องกันการจองซ้ำ (race condition)
      const booth = await tx.booth.findUnique({ where: { boothId } });
      if (!booth || booth.status !== 'available') {
        throw new ConflictError('บูธนี้ไม่ว่างแล้ว (ถูกจองไปก่อนหน้านี้)');
      }

      // Create the booking
      const booking = await tx.booking.create({
        data: {
          vendorId,
          eventId,
          boothId,
          totalAmount,
          status: 'pending',
        },
      });

      // Update booth status to booked
      await tx.booth.update({
        where: { boothId },
        data: { status: 'booked' },
      });

      return booking;
    });
  }

  async findBookingById(bookingId: number) {
    return prisma.booking.findFirst({
      where: { bookingId, deletedAt: null },
      include: {
        booth: true,
        event: true,
      }
    });
  }

  async findBookingsByVendor(vendorId: number): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { vendorId, deletedAt: null },
      include: { booth: true, event: true, payment: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findBookingsByOrganizer(organizerId: number): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { 
        event: { organizerId, deletedAt: null },
        deletedAt: null
      },
      include: { 
        booth: true, 
        event: true, 
        vendor: { select: { username: true, email: true } },
        payment: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateBookingStatusWithTransaction(bookingId: number, newStatus: BookingStatus, boothId: number): Promise<Booking> {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { bookingId },
        data: { status: newStatus },
      });

      // If cancelled, free the booth
      if (newStatus === 'cancelled') {
        await tx.booth.update({
          where: { boothId },
          data: { status: 'available' },
        });
      } 
      // If confirmed, make sure booth is still booked (or we can just leave it as booked)
      // Usually confirmed just means payment is OK. Booth is already 'booked'.

      return booking;
    });
  }
}
