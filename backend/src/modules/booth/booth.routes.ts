import { Router } from 'express';
import { BoothController } from './booth.controller';
import { validateBody } from '../../common/middleware/validate';
import { createZoneSchema, updateZoneSchema, createBoothSchema, updateBoothSchema } from './booth.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new BoothController();

// (Public) ดูโซนและบูธในอีเวนต์
router.get('/events/:eventId/zones', asyncHandler(controller.getZones));
router.get('/events/:eventId/booths', asyncHandler(controller.getBooths));

// ---------------------------------------------------------
// ตั้งแต่ตรงนี้ไปต้องเป็น Organizer และมีสิทธิ์ 'manage_layout' หรือ 'create_event'
// (ใช้ create_event ชั่วคราวก่อนถ้า manage_layout ยังไม่มี)
// ---------------------------------------------------------

// --- Zones ---
router.post(
  '/zones',
  authenticate,
  requirePermission('create_event'),
  validateBody(createZoneSchema),
  asyncHandler(controller.createZone)
);

router.patch(
  '/zones/:id',
  authenticate,
  requirePermission('create_event'),
  validateBody(updateZoneSchema),
  asyncHandler(controller.updateZone)
);

router.delete(
  '/zones/:id',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.deleteZone)
);

// --- Booths ---
router.post(
  '/booths',
  authenticate,
  requirePermission('create_event'),
  validateBody(createBoothSchema),
  asyncHandler(controller.createBooth)
);

router.patch(
  '/booths/:id',
  authenticate,
  requirePermission('create_event'),
  validateBody(updateBoothSchema),
  asyncHandler(controller.updateBooth)
);

router.delete(
  '/booths/:id',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.deleteBooth)
);

export default router;
