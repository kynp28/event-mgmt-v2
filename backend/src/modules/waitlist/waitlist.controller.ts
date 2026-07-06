import { Request, Response } from 'express';
import { WaitlistService } from './waitlist.service';

export class WaitlistController {
  constructor(private readonly waitlistService = new WaitlistService()) {}

  joinWaitlist = async (req: Request, res: Response) => {
    const vendorId = req.user!.userId;
    const { eventId, boothId } = req.body;
    const result = await this.waitlistService.joinWaitlist(vendorId, Number(eventId), Number(boothId));
    res.status(201).json({ message: 'Joined waitlist successfully', data: result });
  };

  getWaitlistByEvent = async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const result = await this.waitlistService.getWaitlistByEvent(eventId);
    res.status(200).json({ data: result });
  };
}
