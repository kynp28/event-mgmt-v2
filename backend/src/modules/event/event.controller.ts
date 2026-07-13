import { Request, Response } from 'express';
import { EventService } from './event.service';
import { ValidationError } from '../../common/errors/AppError';

export class EventController {
  constructor(private readonly eventService = new EventService()) {}

  createEvent = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.eventService.createEvent(organizerId, req.body);
    res.status(201).json({ success: true, message: 'สร้างอีเวนต์สำเร็จ', data: result });
  };

  getMyEvents = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;
    
    const result = await this.eventService.getEventsByOrganizer(organizerId, skip, limit);
    res.status(200).json({ success: true, data: result, meta: { page, limit } });
  };

  getActiveEvents = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;
    
    const result = await this.eventService.getActiveEvents(skip, limit);
    res.status(200).json({ success: true, data: result, meta: { page, limit } });
  };

  getEventById = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.id as string, 10);
    if (isNaN(eventId)) throw new ValidationError('Invalid event ID');
    const result = await this.eventService.getEventById(eventId);
    res.status(200).json({ success: true, data: result });
  };

  updateEvent = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const eventId = parseInt(req.params.id as string, 10);
    if (isNaN(eventId)) throw new ValidationError('Invalid event ID');
    const result = await this.eventService.updateEvent(eventId, organizerId, req.body);
    res.status(200).json({ success: true, message: 'อัปเดตอีเวนต์สำเร็จ', data: result });
  };

  deleteEvent = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const eventId = parseInt(req.params.id as string, 10);
    if (isNaN(eventId)) throw new ValidationError('Invalid event ID');
    await this.eventService.deleteEvent(eventId, organizerId);
    res.status(200).json({ success: true, message: 'ลบอีเวนต์สำเร็จ' });
  };
}
