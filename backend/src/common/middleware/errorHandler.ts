import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // กรณี error เป็น Zod validation error (ยังไม่ได้แปลงผ่าน validate middleware)
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
      errors: err.issues,
    });
    return;
  }

  // กรณี error ที่เราออกแบบไว้เอง (ValidationError, NotFoundError ฯลฯ)
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { message: err.message };
    if ('details' in err && err.details) {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // กรณี error ที่ไม่คาดคิด — log ไว้เพื่อ debug แต่ไม่เผย stack trace ให้ client
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
}