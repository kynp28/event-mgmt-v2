import { BookingRepository } from './booking.repository';
import { BoothRepository } from '../booth/booth.repository';
import { EventRepository } from '../event/event.repository';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/AppError';
import { BookingStatus } from '@prisma/client';

export class BookingService {
  constructor(
    private readonly bookingRepository = new BookingRepository(),
    private readonly boothRepository = new BoothRepository(),
    private readonly eventRepository = new EventRepository()
  ) {}

  async createBooking(vendorId: number, eventId: number, boothId: number) {
    const booth = await this.boothRepository.findBoothById(boothId);
    if (!booth) {
      throw new NotFoundError('ไม่พบบูธที่ต้องการจอง');
    }

    if (booth.eventId !== eventId) {
      throw new ConflictError('บูธนี้ไม่ได้อยู่ในอีเวนต์ที่ระบุ');
    }

    if (booth.status !== 'available') {
      throw new ConflictError('บูธนี้ไม่ว่าง (ถูกจองหรือประมูลไปแล้ว)');
    }

    const event = await this.eventRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundError('ไม่พบอีเวนต์');
    }
    if (event.eventStatus !== 'open') {
      throw new ConflictError('ไม่สามารถจองได้ อีเวนต์นี้ยังไม่เปิดรับจองหรือปิดแล้ว');
    }

    const totalAmount = Number(booth.price);

    return this.bookingRepository.createBookingWithTransaction(vendorId, eventId, boothId, totalAmount);
  }

  async getMyBookings(vendorId: number) {
    return this.bookingRepository.findBookingsByVendor(vendorId);
  }

  async getOrganizerBookings(organizerId: number) {
    return this.bookingRepository.findBookingsByOrganizer(organizerId);
  }

  async updateBookingStatus(bookingId: number, status: BookingStatus, organizerId: number) {
    const booking = await this.bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundError('ไม่พบข้อมูลการจอง');
    }

    // Check if the user is the organizer of the event
    if (booking.event.organizerId !== organizerId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์จัดการการจองในอีเวนต์นี้');
    }

    return this.bookingRepository.updateBookingStatusWithTransaction(bookingId, status, booking.boothId);
  }
}
