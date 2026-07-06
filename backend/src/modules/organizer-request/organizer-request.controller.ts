import { Request, Response } from 'express';
import { OrganizerRequestService } from './organizer-request.service';

export class OrganizerRequestController {
  constructor(private readonly requestService = new OrganizerRequestService()) {}

  createRequest = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.requestService.createRequest(userId, req.body);
    res.status(201).json({ message: 'ส่งคำขอเป็นผู้จัดงานสำเร็จ', ...result });
  };

  getMyRequests = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.requestService.getMyRequests(userId);
    res.status(200).json({ data: result });
  };

  getAllRequests = async (req: Request, res: Response) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const result = await this.requestService.getAllRequests(status);
    res.status(200).json({ data: result });
  };

  reviewRequest = async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const requestId = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    
    const result = await this.requestService.reviewRequest(requestId, status, adminId);
    res.status(200).json({ message: `เปลี่ยนสถานะคำขอเป็น ${status} สำเร็จ`, ...result });
  };
}
