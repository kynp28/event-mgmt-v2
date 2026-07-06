import { Request, Response } from 'express';
import { PenaltyService } from './penalty.service';
import { PenaltyStatus } from '@prisma/client';

export class PenaltyController {
  constructor(private readonly penaltyService = new PenaltyService()) {}

  createPenalty = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const { vendorId, eventId, reason, fineAmount } = req.body;
    
    const result = await this.penaltyService.createPenalty(organizerId, vendorId, eventId, reason, fineAmount);
    res.status(201).json({ message: 'บันทึกการลงโทษสำเร็จ', data: result });
  };

  getMyPenalties = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const result = await this.penaltyService.getVendorPenalties(vendorId);
    res.status(200).json({ data: result });
  };

  getEventPenalties = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const eventId = parseInt(req.params.eventId as string, 10);
    const result = await this.penaltyService.getEventPenalties(organizerId, eventId);
    res.status(200).json({ data: result });
  };

  updatePenaltyStatus = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const penaltyId = parseInt(req.params.id as string, 10);
    const status = req.body.status as PenaltyStatus;

    const result = await this.penaltyService.updatePenaltyStatus(organizerId, penaltyId, status);
    res.status(200).json({ message: `อัปเดตสถานะเป็น ${status} สำเร็จ`, data: result });
  };
}
