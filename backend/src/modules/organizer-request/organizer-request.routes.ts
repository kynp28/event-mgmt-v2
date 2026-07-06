import { Router } from 'express';
import { OrganizerRequestController } from './organizer-request.controller';
import { validateBody } from '../../common/middleware/validate';
import { createRequestSchema, updateRequestStatusSchema } from './organizer-request.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new OrganizerRequestController();

// (User) ส่งคำขอ
router.post(
  '/',
  authenticate,
  validateBody(createRequestSchema),
  asyncHandler(controller.createRequest)
);

// (User) ดูคำขอของตัวเอง
router.get(
  '/my',
  authenticate,
  asyncHandler(controller.getMyRequests)
);

// (Admin) ดูคำขอทั้งหมด (สามารถ filter ด้วย ?status=pending)
router.get(
  '/',
  authenticate,
  requirePermission('approve_organizer'),
  asyncHandler(controller.getAllRequests)
);

// (Admin) อนุมัติ/ปฏิเสธคำขอ
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('approve_organizer'),
  validateBody(updateRequestStatusSchema),
  asyncHandler(controller.reviewRequest)
);

export default router;
