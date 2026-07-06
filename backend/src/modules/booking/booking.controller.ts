import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { BookingStatus } from '@prisma/client';
import { ValidationError } from '../../common/errors/AppError';

export class BookingController {
  constructor(private readonly bookingService = new BookingService()) {}

  createBooking = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { eventId, boothId } = req.body;
    
    const result = await this.bookingService.createBooking(vendorId, eventId, boothId);
    res.status(201).json({ message: 'จองบูธสำเร็จ', data: result });
  };

  getMyBookings = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const result = await this.bookingService.getMyBookings(vendorId);
    res.status(200).json({ data: result });
  };

  getOrganizerBookings = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.bookingService.getOrganizerBookings(organizerId);
    res.status(200).json({ data: result });
  };

  updateBookingStatus = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const bookingId = parseInt(req.params.id as string, 10);
    if (isNaN(bookingId)) throw new ValidationError('Invalid booking ID');
    const status = req.body.status as BookingStatus;

    const result = await this.bookingService.updateBookingStatus(bookingId, status, organizerId);
    res.status(200).json({ message: `อัปเดตสถานะเป็น ${status} สำเร็จ`, data: result });
  };
}
