import { Router } from 'express';
import { EventController } from './event.controller';
import { validateBody } from '../../common/middleware/validate';
import { createEventSchema, updateEventSchema } from './event.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new EventController();

// (Public) ดูอีเวนต์ที่เปิดอยู่
router.get(
  '/active',
  asyncHandler(controller.getActiveEvents)
);

// (Organizer) ดูอีเวนต์ของตัวเอง — ต้องอยู่ก่อน /:id เพื่อไม่ให้ถูกจับเป็น param
router.get(
  '/organizer/my-events',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.getMyEvents)
);

// (Public) ดูรายละเอียดอีเวนต์
router.get(
  '/:id',
  asyncHandler(controller.getEventById)
);

// (Organizer) สร้างอีเวนต์
router.post(
  '/',
  authenticate,
  requirePermission('create_event'),
  validateBody(createEventSchema),
  asyncHandler(controller.createEvent)
);

// (Organizer) อัปเดตอีเวนต์
router.patch(
  '/:id',
  authenticate,
  requirePermission('create_event'),
  validateBody(updateEventSchema),
  asyncHandler(controller.updateEvent)
);

// (Organizer) ลบอีเวนต์ (Soft Delete)
router.delete(
  '/:id',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.deleteEvent)
);

export default router;
