import { Request, Response, NextFunction } from 'express';
import { RbacService } from './rbac.service';
import { ForbiddenError, UnauthorizedError } from '../../common/errors/AppError';

const rbacService = new RbacService();

// ใช้งาน: requirePermission('create_event')
// ต้องใช้หลัง authenticate middleware เสมอ
export function requirePermission(permissionName: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const hasPermission = await rbacService.hasPermission(
        req.user.userId,
        permissionName
      );

      if (!hasPermission) {
        throw new ForbiddenError(`ต้องการสิทธิ์ "${permissionName}" เพื่อดำเนินการนี้`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}