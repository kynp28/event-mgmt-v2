import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../common/middleware/validate';
import { registerSchema, loginSchema, appealSchema, updateProfileSchema } from './auth.validator';
import { authenticate } from '../../common/middleware/authenticate';
import { asyncHandler } from '../../common/utils/asyncHandler';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const appealLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // max 3 appeals per hour per IP
  message: { success: false, message: 'ส่งคำร้องบ่อยเกินไป กรุณาลองใหม่ในภายหลัง' }
});

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  '/logout',
  asyncHandler(authController.logout)
);

import { upload } from '../../common/middleware/upload';

router.post(
  '/appeal',
  appealLimiter,
  upload.single('evidence'),
  validateBody(appealSchema),
  asyncHandler(authController.submitAppeal)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getMe)
);

router.patch(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);

export default router;