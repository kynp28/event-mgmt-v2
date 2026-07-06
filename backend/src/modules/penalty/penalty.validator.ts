import { z } from 'zod';

export const createPenaltySchema = z.object({
  vendorId: z.number().int().positive('vendorId ต้องเป็นตัวเลขบวก'),
  eventId: z.number().int().positive('eventId ต้องเป็นตัวเลขบวก'),
  reason: z.string().min(1, 'ต้องระบุเหตุผลการลงโทษ'),
  fineAmount: z.number().min(0, 'ค่าปรับต้องไม่ติดลบ'),
});

export const updatePenaltyStatusSchema = z.object({
  status: z.enum(['unpaid', 'paid']),
});
