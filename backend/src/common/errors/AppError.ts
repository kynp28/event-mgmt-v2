// Base error class — ทุก custom error ต้อง extend จากตัวนี้
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // แยกจาก bug ที่ไม่คาดคิด (programmer error)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — ข้อมูล input ไม่ถูกต้อง (ใช้คู่กับ Zod validation)
export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.details = details;
  }
}

// 401 — ยังไม่ได้เข้าสู่ระบบ หรือ token ไม่ถูกต้อง
export class UnauthorizedError extends AppError {
  constructor(message = 'กรุณาเข้าสู่ระบบก่อนใช้งาน') {
    super(message, 401);
  }
}

// 403 — เข้าสู่ระบบแล้วแต่ไม่มีสิทธิ์ทำรายการนี้
export class ForbiddenError extends AppError {
  constructor(message = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้') {
    super(message, 403);
  }
}

// 404 — ไม่พบข้อมูลที่ร้องขอ
export class NotFoundError extends AppError {
  constructor(message = 'ไม่พบข้อมูลที่ร้องขอ') {
    super(message, 404);
  }
}

// 409 — ข้อมูลขัดแย้งกับสิ่งที่มีอยู่แล้ว (เช่น email ซ้ำ, booth_no ซ้ำ)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}