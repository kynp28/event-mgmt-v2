import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateBody } from '../../common/middleware/validate';
import { createBookingSchema, updateBookingStatusSchema } from './booking.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const controller = new BookingController();

// (Vendor) จองบูธ (multiple)
router.post(
  '/multiple',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.createBookings)
);

// (Vendor) Hold booths
router.post(
  '/hold',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.holdBooths)
);

// (Vendor) Release booths
router.post(
  '/release',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.releaseBooths)
);

// (Vendor) จองบูธ (single)
router.post(
  '/',
  authenticate,
  requirePermission('book_booth'),
  validateBody(createBookingSchema),
  asyncHandler(controller.createBooking)
);

// (Vendor) ดูการจองของตัวเอง
router.get(
  '/my',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.getMyBookings)
);

// (Organizer) ดูการจองในอีเวนต์ของตัวเอง
router.get(
  '/organizer',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.getOrganizerBookings)
);

// (Organizer) อัปเดตสถานะการจอง (เช่น ยกเลิก)
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('create_event'),
  validateBody(updateBookingStatusSchema),
  asyncHandler(controller.updateBookingStatus)
);

// (Vendor) ยืนยันสิทธิ์จากคิวสำรอง
router.post(
  '/confirm-waitlist',
  authenticate,
  requirePermission('book_booth'),
  asyncHandler(controller.confirmWaitlist)
);


// (Organizer) Verify Payment
router.patch(
  '/:id/verify-payment',
  authenticate,
  requirePermission('create_event'),
  asyncHandler(controller.verifyPayment)
);

export default router;
