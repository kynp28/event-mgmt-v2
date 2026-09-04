import { prisma } from '../../config/prisma';
import { Payment, PaymentStatus } from '@prisma/client';

export class PaymentRepository {
  async upsertPayment(bookingId: number, slipImage: string): Promise<Payment> {
    return prisma.payment.upsert({
      where: { bookingId },
      update: { slipImage, status: 'pending', verifiedBy: null, verifiedAt: null },
      create: { bookingId, slipImage, status: 'pending' }
    });
  }

  async findPaymentById(paymentId: number) {
    return prisma.payment.findFirst({
      where: { paymentId },
      include: { booking: { include: { event: true, booth: true } } }
    });
  }

  async findPaymentByBookingId(bookingId: number) {
    return prisma.payment.findUnique({
      where: { bookingId }
    });
  }

  async findPaymentsByVendor(vendorId: number) {
    return prisma.payment.findMany({
      where: { booking: { vendorId } },
      include: { booking: { include: { event: true, booth: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findPaymentsByEvent(eventId: number) {
    return prisma.payment.findMany({
      where: { booking: { eventId } },
      include: { booking: { include: { booth: true, vendor: { select: { username: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllPendingPayments(organizerId: number) {
    return prisma.payment.findMany({
      where: { 
        status: 'pending',
        booking: { event: { organizerId } }
      },
      include: { booking: { include: { event: true, booth: true, vendor: { select: { username: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePaymentStatusWithTransaction(
    paymentId: number, 
    status: PaymentStatus, 
    verifiedBy: number, 
    bookingId: number,
    options?: { reason?: string; action?: 'request_reupload' | 'cancel_booking' }
  ): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const paymentResult = await tx.payment.updateMany({
        where: { 
          paymentId,
          status: 'pending',
          booking: {
            status: 'pending',
            paymentDeadline: { gt: new Date() }
          }
        },
        data: {
          status,
          verifiedBy,
          verifiedAt: new Date(),
        }
      });

      if (paymentResult.count !== 1) {
        throw new Error('Payment is no longer valid or booking has expired');
      }

      const payment = await tx.payment.findUniqueOrThrow({ where: { paymentId } });

      if (status === 'verified') {
        const confirmedBooking = await tx.booking.update({
          where: { bookingId },
          data: { status: 'confirmed', cancelReason: null }
        });
        
        await tx.booth.update({
          where: { boothId: confirmedBooking.boothId },
          data: { status: 'booked', lockState: 'none' }
        });
      } else if (status === 'rejected') {
        const reason = options?.reason || 'สลิปไม่ถูกต้อง';
        const action = options?.action || 'request_reupload';

        if (action === 'cancel_booking') {
          const cancelledBooking = await tx.booking.update({
            where: { bookingId },
            data: { status: 'cancelled', cancelReason: reason }
          });

          await tx.booth.update({
            where: { boothId: cancelledBooking.boothId },
            data: { 
              status: 'available', 
              lockState: 'none', 
              lockedByUserId: null, 
              lockedAt: null, 
              lockedUntil: null 
            }
          });
        } else {
          // request_reupload: booking remains pending so vendor can upload a new slip
          // Extend payment deadline by 30 minutes so vendor has time to upload new slip
          await tx.booking.update({
            where: { bookingId },
            data: { 
              cancelReason: `สลิปไม่ถูกต้อง: ${reason}`,
              paymentDeadline: new Date(Date.now() + 30 * 60 * 1000)
            }
          });
        }
      }

      return payment;
    });
  }
}
