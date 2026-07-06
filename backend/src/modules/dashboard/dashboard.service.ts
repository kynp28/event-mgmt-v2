import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  constructor(private readonly dashboardRepository = new DashboardRepository()) {}

  async getAdminDashboard() {
    return this.dashboardRepository.getAdminStats();
  }

  async getOrganizerDashboard(organizerId: number) {
    return this.dashboardRepository.getOrganizerStats(organizerId);
  }
}
