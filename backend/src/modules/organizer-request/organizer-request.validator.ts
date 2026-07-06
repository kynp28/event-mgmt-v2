import { z } from 'zod';

export const createRequestSchema = z.object({
  feeAmount: z.number().min(0, 'ค่าธรรมเนียมต้องไม่ติดลบ'),
  invoicePath: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});
