import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService = new DashboardService()) {}

  getAdminStats = async (_req: Request, res: Response) => {
    const result = await this.dashboardService.getAdminDashboard();
    res.status(200).json({ data: result });
  };

  getOrganizerStats = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.dashboardService.getOrganizerDashboard(organizerId);
    res.status(200).json({ data: result });
  };
}
