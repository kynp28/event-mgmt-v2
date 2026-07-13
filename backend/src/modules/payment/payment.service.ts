import { PaymentRepository } from './payment.repository';
import { BookingRepository } from '../booking/booking.repository';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/AppError';
import { PaymentStatus } from '@prisma/client';

import { prisma } from '../../config/prisma';

export class PaymentService {
  constructor(
    private readonly paymentRepository = new PaymentRepository(),
    private readonly bookingRepository = new BookingRepository()
  ) {}

  async submitPayment(vendorId: number, bookingId: number, slipImage: string) {
    const booking = await this.bookingRepository.findBookingById(bookingId);
    if (!booking) throw new NotFoundError('ไม่พบการจองนี้');
    if (booking.vendorId !== vendorId) throw new ForbiddenError('คุณไม่มีสิทธิ์ชำระเงินให้การจองนี้');
    if (booking.status === 'confirmed') throw new ConflictError('การจองนี้ได้รับการยืนยันแล้ว');
    if (booking.status === 'cancelled') throw new ConflictError('การจองนี้ถูกยกเลิกแล้ว');

    const existingPayment = await this.paymentRepository.findPaymentByBookingId(bookingId);
    if (existingPayment && existingPayment.status === 'pending') {
      throw new ConflictError('มีการส่งสลิปชำระเงินแล้วและกำลังรอตรวจสอบ');
    }
    if (existingPayment && existingPayment.status === 'verified') {
      throw new ConflictError('ชำระเงินเรียบร้อยแล้ว');
    }

    return this.paymentRepository.upsertPayment(bookingId, slipImage);
  }

  async getMyPayments(vendorId: number) {
    return this.paymentRepository.findPaymentsByVendor(vendorId);
  }

  async getEventPayments(eventId: number, organizerId: number) {
    const event = await prisma.event.findUnique({ where: { eventId } });
    if (!event) throw new NotFoundError('ไม่พบอีเวนต์');
    if (event.organizerId !== organizerId) throw new ForbiddenError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลการชำระเงินของอีเวนต์นี้');
    
    return this.paymentRepository.findPaymentsByEvent(eventId);
  }

  async getAllPendingPayments(organizerId: number) {
    return this.paymentRepository.findAllPendingPayments(organizerId);
  }

  async verifyPayment(paymentId: number, status: PaymentStatus, verifierId: number, isAdmin: boolean = false) {
    const payment = await this.paymentRepository.findPaymentById(paymentId);
    if (!payment) throw new NotFoundError('ไม่พบข้อมูลชำระเงิน');
    if (payment.status !== 'pending') throw new ConflictError('การชำระเงินนี้ได้รับการตรวจสอบแล้ว');

    // Security: ถ้าไม่ใช่ Admin ต้องเป็นเจ้าของ Event ที่เกี่ยวข้องเท่านั้น
    if (!isAdmin && payment.booking?.event?.organizerId !== verifierId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์ยืนยันการชำระเงินนี้');
    }

    return this.paymentRepository.updatePaymentStatusWithTransaction(paymentId, status, verifierId, payment.bookingId);
  }
}
