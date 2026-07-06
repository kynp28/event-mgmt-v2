import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../common/middleware/validate';
import { registerSchema, loginSchema } from './auth.validator';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

export default router;