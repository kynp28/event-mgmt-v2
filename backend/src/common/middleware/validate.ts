import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors/AppError';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('ข้อมูลที่ส่งมาไม่ถูกต้อง', result.error.issues);
    }
    req.body = result.data;
    next();
  };
}