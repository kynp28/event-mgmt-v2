import { Request, Response } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  private adminService = new AdminService();

  getAllEvents = async (req: Request, res: Response) => {
    const events = await this.adminService.getAllEvents();
    res.status(200).json(events);
  };

  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.adminService.getAllUsers();
    res.status(200).json(users);
  };
}
