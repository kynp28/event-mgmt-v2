import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new DashboardController();

// (Admin) สถิติรวมของระบบ
router.get(
  '/admin',
  authenticate,
  requirePermission('view_admin_dashboard'),
  asyncHandler(controller.getAdminStats)
);

// (Organizer) สถิติของ Organizer
router.get(
  '/organizer',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.getOrganizerStats)
);

export default router;
