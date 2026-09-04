import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { UserStatus } from '@prisma/client';
import { ValidationError } from '../../common/errors/AppError';

export class AdminController {
  private adminService = new AdminService();

  getAllEvents = async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;
    
    const events = await this.adminService.getAllEvents(skip, limit);
    res.status(200).json({ success: true, data: events, meta: { page, limit } });
  };

  getAllUsers = async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;
    
    const users = await this.adminService.getAllUsers(skip, limit);
    res.status(200).json({ success: true, data: users, meta: { page, limit } });
  };

  updateUserStatus = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) throw new ValidationError('Invalid user ID');
    
    const { status, suspendReason } = req.body;
    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      throw new ValidationError('Invalid status');
    }
    
    if (status === 'suspended' && !suspendReason) {
      throw new ValidationError('กรุณาระบุเหตุผลในการระงับบัญชี');
    }
    
    const updatedUser = await this.adminService.updateUserStatus(userId, status as UserStatus, suspendReason);
    res.status(200).json({ success: true, message: 'อัปเดตสถานะผู้ใช้สำเร็จ', data: updatedUser });
  };

  getAppeals = async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;
    
    const appeals = await this.adminService.getAppeals(skip, limit);
    res.status(200).json({ success: true, data: appeals, meta: { page, limit } });
  };

  updateAppealStatus = async (req: Request, res: Response) => {
    const appealId = parseInt(req.params.id as string, 10);
    if (isNaN(appealId)) throw new ValidationError('Invalid appeal ID');
    
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      throw new ValidationError('Invalid status');
    }
    
    const adminId = req.user!.userId;
    const updatedAppeal = await this.adminService.updateAppealStatus(appealId, status as 'approved' | 'rejected', adminId);
    res.status(200).json({ success: true, message: 'จัดการคำร้องสำเร็จ', data: updatedAppeal });
  };
}
