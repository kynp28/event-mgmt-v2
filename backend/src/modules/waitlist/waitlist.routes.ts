import { Router } from 'express';
import { WaitlistController } from './waitlist.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { requirePermission } from '../rbac/rbac.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validateBody } from '../../common/middleware/validate';
import { joinWaitlistSchema } from './waitlist.validator';

const router = Router();
const controller = new WaitlistController();

router.post('/', authenticate, requirePermission('book_booth'), validateBody(joinWaitlistSchema), asyncHandler(controller.joinWaitlist));
router.get('/events/:eventId', authenticate, requirePermission('create_event'), asyncHandler(controller.getWaitlistByEvent));

export default router;
