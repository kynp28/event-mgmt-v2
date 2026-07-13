import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new AdminController();

// Only admin can view these (using manage_users or view_admin_dashboard permission)
router.get('/events', authenticate, requirePermission('view_admin_dashboard'), asyncHandler(controller.getAllEvents));
router.get('/users', authenticate, requirePermission('manage_users'), asyncHandler(controller.getAllUsers));
router.patch('/users/:id/status', authenticate, requirePermission('manage_users'), asyncHandler(controller.updateUserStatus));

export default router;
