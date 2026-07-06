import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validateBody } from '../../common/middleware/validate';
import { submitPaymentSchema, verifyPaymentSchema } from './payment.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new PaymentController();

// (Vendor) แจ้งชำระเงิน/อัปโหลดสลิป
router.post(
  '/',
  authenticate,
  requirePermission('book_booth'),
  validateBody(submitPaymentSchema),
  asyncHandler(controller.submitPayment)
);

// (Vendor) ดูประวัติการชำระเงิน
router.get(
  '/my-payments',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.getMyPayments)
);

// (Admin) ดูสลิปที่รอตรวจสอบทั้งหมด
router.get(
  '/pending',
  authenticate,
  requirePermission('create_event'), // Assuming admin has this, or we could change this
  asyncHandler(controller.getAllPendingPayments)
);

// (Organizer / Admin) ดูการชำระเงินของอีเวนต์
router.get(
  '/events/:eventId',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.getEventPayments)
);

// (Organizer / Admin) ตรวจสอบและอนุมัติสลิป
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('create_event'),
  validateBody(verifyPaymentSchema),
  asyncHandler(controller.verifyPayment)
);

export default router;
