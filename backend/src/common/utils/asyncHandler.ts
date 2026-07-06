import { Request, Response, NextFunction, RequestHandler } from 'express';

// ห่อ async controller function เพื่อให้ error ที่ throw ออกมาถูกส่งต่อไปยัง errorHandler
// อัตโนมัติ โดยไม่ต้องเขียน try-catch ซ้ำในทุก controller
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}