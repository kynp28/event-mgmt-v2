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
  // สมัครได้แค่ vendor หรือ visitor เท่านั้น — organizer ต้องขอสิทธิ์แยกต่างหาก (CI.02 6.1.1)
  role: z.enum(['vendor', 'visitor']),
});

export const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const appealSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AppealInput = z.infer<typeof appealSchema>;