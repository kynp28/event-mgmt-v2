import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../common/middleware/validate';
import { registerSchema, loginSchema } from './auth.validator';
import { asyncHandler } from '../../common/utils/asyncHandler';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
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

export default router;