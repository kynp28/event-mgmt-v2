import { prisma } from '../../config/prisma';
import { Booking, BookingStatus } from '@prisma/client';
import { ConflictError } from '../../common/errors/AppError';
import { getRedisClient, boothLockKey } from '../../common/utils/redis';

const BOOTH_LOCK_TTL_SECONDS = 5 * 60; // 5 minutes

export class BookingRepository {
  async createBookingWithTransaction(
    vendorId: number, 
    eventId: number, 
    boothId: number, 
    totalAmount: number
  ): Promise<Booking> {
    const redis = getRedisClient();
    const lockKey = boothLockKey(boothId);

    // 1) Redis SETNX for rapid concurrency control
    const acquired = await redis.set(lockKey, vendorId.toString(), 'EX', BOOTH_LOCK_TTL_SECONDS, 'NX');
    if (acquired !== 'OK') {
      throw new ConflictError('บูธนี้กำลังถูกจองโดยผู้อื่น กรุณาลองบูธอื่น (Redis Lock)');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 2) Optimistic locking via DB UPDATE (MySQL syntax)
        const affectedRows = await tx.$executeRaw`
          UPDATE booths
          SET lock_state = 'payment_pending', 
              locked_by_user_id = ${vendorId}, 
              locked_at = NOW(),
              locked_until = DATE_ADD(NOW(), INTERVAL 5 MINUTE), 
              version = version + 1
          WHERE booth_id = ${boothId} 
            AND status = 'available' 
            AND lock_state = 'none'
        `;

        if (affectedRows === 0) {
          throw new ConflictError('บูธนี้ไม่ว่างแล้ว (DB Lock Failed)');
        }

        // 3) Create booking record
        const booking = await tx.booking.create({
          data: {
            vendorId,
            eventId,
            boothId,
            totalAmount,
            status: 'pending',
            paymentDeadline: new Date(Date.now() + BOOTH_LOCK_TTL_SECONDS * 1000)
          },
        });

        return booking;
      });
    } catch (err) {
      // Release Redis lock if DB fails
      await redis.del(lockKey).catch(() => {});
      throw err;
    }
  }

  async confirmWaitlistBookingWithTransaction(vendorId: number, waitlistEntryId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1) Verify waitlist offer
      const entryRows: any[] = await tx.$queryRaw`
        SELECT waitlist_id, booth_id, vendor_id, offer_deadline
        FROM waitlist
        WHERE waitlist_id = ${waitlistEntryId} 
          AND status = 'waiting' 
          AND offer_deadline > NOW()
        FOR UPDATE
      `;

      if (entryRows.length === 0) {
        throw new ConflictError('สิทธิ์นี้หมดเวลาแล้ว หรือถูกใช้ไปแล้ว (Offer Expired)');
      }
      
      const entry = entryRows[0];

      if (entry.vendor_id !== vendorId) {
        throw new ConflictError('สิทธิ์นี้ไม่ใช่ของบัญชีนี้');
      }

      // 2) Close waitlist entry
      await tx.waitlist.update({
        where: { waitlistId: entry.waitlist_id },
        data: { status: 'allocated' }
      });

      const WAITLIST_PAYMENT_WINDOW_HOURS = 24;

      // 3) Change booth lockState
      const affectedRows = await tx.$executeRaw`
        UPDATE booths
        SET lock_state = 'payment_pending', 
            locked_until = DATE_ADD(NOW(), INTERVAL ${WAITLIST_PAYMENT_WINDOW_HOURS} HOUR),
            version = version + 1
        WHERE booth_id = ${entry.booth_id} 
          AND lock_state = 'waitlist_reserved' 
          AND locked_by_user_id = ${vendorId}
      `;

      if (affectedRows === 0) {
        throw new ConflictError('สถานะบูธไม่ตรงกัน กรุณาติดต่อ admin (State Mismatch)');
      }

      // 4) Create booking record
      const booking = await tx.booking.create({
        data: {
          vendorId,
          eventId: (await tx.booth.findUnique({ where: { boothId: entry.booth_id } }))!.eventId,
          boothId: entry.booth_id,
          totalAmount: (await tx.booth.findUnique({ where: { boothId: entry.booth_id } }))!.price,
          status: 'pending',
          paymentDeadline: new Date(Date.now() + WAITLIST_PAYMENT_WINDOW_HOURS * 60 * 60 * 1000)
        }
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

      // If cancelled, free the booth entirely
      if (newStatus === 'cancelled') {
        await tx.booth.update({
          where: { boothId },
          data: { status: 'available', lockState: 'none' },
        });
      } 
      // If confirmed, make the booth booked and release lock
      else if (newStatus === 'confirmed') {
        await tx.booth.update({
          where: { boothId },
          data: { status: 'booked', lockState: 'none' }
        });
      }

      return booking;
    });
  }
}
