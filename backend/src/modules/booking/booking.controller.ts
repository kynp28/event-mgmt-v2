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

  createBookings = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { eventId, boothIds } = req.body;
    
    const result = await this.bookingService.createBookings(vendorId, eventId, boothIds);
    res.status(201).json({ message: 'จองบูธสำเร็จ', data: result });
  };

  holdBooths = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { eventId, boothIds } = req.body;
    
    const result = await this.bookingService.holdBooths(vendorId, eventId, boothIds);
    res.status(200).json({ message: 'กันบูธสำเร็จ', data: result });
  };

  releaseBooths = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { eventId, boothIds } = req.body;
    
    const result = await this.bookingService.releaseBooths(vendorId, eventId, boothIds);
    res.status(200).json({ message: 'ปล่อยบูธสำเร็จ', data: result });
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

  confirmWaitlist = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { waitlistEntryId } = req.body;
    
    if (!waitlistEntryId) throw new ValidationError('waitlistEntryId is required');

    const result = await this.bookingService.confirmWaitlistBooking(vendorId, waitlistEntryId);
    res.status(200).json({ message: 'ยืนยันการใช้สิทธิ์คิวสำรองและจองบูธสำเร็จ', data: result });
  };

  uploadSlip = async (req: Request, res: Response) => {
    const { bookingIds, slipImage } = req.body;
    if (!bookingIds || !Array.isArray(bookingIds) || !slipImage) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }
    const result = await this.bookingService.uploadSlip(bookingIds, slipImage);
    res.status(200).json({ success: true, message: 'อัปโหลดสลิปสำเร็จ', data: result });
  };

  verifyPayment = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const bookingId = parseInt(req.params.id, 10);
    const { status, reason } = req.body;
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    
    const result = await this.bookingService.verifyPayment(bookingId, status, reason, organizerId);
    res.status(200).json({ success: true, message: 'บันทึกผลการตรวจสอบสำเร็จ', data: result });
  };
}
