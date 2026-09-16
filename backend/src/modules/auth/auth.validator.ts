import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(100, 'ชื่อผู้ใช้ยาวเกินไป'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z
    .string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(255, 'รหัสผ่านยาวเกินไป'),
  role: z.enum(['vendor', 'visitor', 'organizer']),
});

export const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const appealSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร'),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(100).optional(),
  avatarUrl: z.string().nullable().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(255).optional(),
  bankName: z.string().max(100).nullable().optional(),
  bankAccountNo: z.string().max(50).nullable().optional(),
  bankAccountName: z.string().max(150).nullable().optional(),
  promptpayNo: z.string().max(50).nullable().optional(),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AppealInput = z.infer<typeof appealSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;