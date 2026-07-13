import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { UserStatus } from '@prisma/client';
import { ValidationError } from '../../common/errors/AppError';

export class AdminController {
  private adminService = new AdminService();

  getAllEvents = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;
    
    const events = await this.adminService.getAllEvents(skip, limit);
    res.status(200).json({ success: true, data: events, meta: { page, limit } });
  };

  getAllUsers = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;
    
    const users = await this.adminService.getAllUsers(skip, limit);
    res.status(200).json({ success: true, data: users, meta: { page, limit } });
  };

  updateUserStatus = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) throw new ValidationError('Invalid user ID');
    
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      throw new ValidationError('Invalid status');
    }
    
    const updatedUser = await this.adminService.updateUserStatus(userId, status as UserStatus);
    res.status(200).json({ success: true, message: 'อัปเดตสถานะผู้ใช้สำเร็จ', data: updatedUser });
  };
}
