import { Router } from 'express';
import { PenaltyController } from './penalty.controller';
import { validateBody } from '../../common/middleware/validate';
import { createPenaltySchema, updatePenaltyStatusSchema } from './penalty.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new PenaltyController();

// (Vendor) ดูประวัติการโดนลงโทษของตัวเอง
router.get(
  '/my-penalties',
  authenticate,
  requirePermission('book_booth'), // Vendor role checking
  asyncHandler(controller.getMyPenalties)
);

// (Organizer) เรียกดูการลงโทษในอีเวนต์ของตน
router.get(
  '/events/:eventId',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.getEventPenalties)
);

// (Organizer) สั่งลงโทษ Vendor
router.post(
  '/',
  authenticate,
  requirePermission('create_event'),
  validateBody(createPenaltySchema),
  asyncHandler(controller.createPenalty)
);

// (Organizer) อัปเดตสถานะการจ่ายค่าปรับ
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('create_event'),
  validateBody(updatePenaltyStatusSchema),
  asyncHandler(controller.updatePenaltyStatus)
);

export default router;
