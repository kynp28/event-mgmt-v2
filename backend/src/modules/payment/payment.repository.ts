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

  async updatePaymentStatusWithTransaction(paymentId: number, status: PaymentStatus, verifiedBy: number, bookingId: number): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { paymentId },
        data: {
          status,
          verifiedBy,
          verifiedAt: new Date(),
        }
      });

      if (status === 'verified') {
        await tx.booking.update({
          where: { bookingId },
          data: { status: 'confirmed' }
        });
      }

      return payment;
    });
  }
}
