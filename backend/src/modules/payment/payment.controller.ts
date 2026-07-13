import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { PaymentStatus } from '@prisma/client';
import { ValidationError } from '../../common/errors/AppError';

export class PaymentController {
  constructor(private readonly paymentService = new PaymentService()) {}

  submitPayment = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { bookingId, slipImage } = req.body;
    
    const result = await this.paymentService.submitPayment(vendorId, bookingId, slipImage);
    res.status(201).json({ message: 'ส่งสลิปชำระเงินสำเร็จ', data: result });
  };

  getMyPayments = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const result = await this.paymentService.getMyPayments(vendorId);
    res.status(200).json({ data: result });
  };

  getEventPayments = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const eventId = parseInt(req.params.eventId as string, 10);
    if (isNaN(eventId)) throw new ValidationError('Invalid event ID');
    const result = await this.paymentService.getEventPayments(eventId, organizerId);
    res.status(200).json({ data: result });
  };

  getAllPendingPayments = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.paymentService.getAllPendingPayments(organizerId);
    res.status(200).json({ data: result });
  };

  verifyPayment = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const isAdmin = req.user!.roles.includes('admin');
    const paymentId = parseInt(req.params.id as string, 10);
    if (isNaN(paymentId)) throw new ValidationError('Invalid payment ID');
    const status = req.body.status as PaymentStatus;

    const result = await this.paymentService.verifyPayment(paymentId, status, userId, isAdmin);
    res.status(200).json({ message: `เปลี่ยนสถานะเป็น ${status} สำเร็จ`, data: result });
  };
}
