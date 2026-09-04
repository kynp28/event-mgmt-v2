import { z } from 'zod';

export const submitPaymentSchema = z.object({
  bookingId: z.number().int().positive('bookingId ต้องเป็นตัวเลขบวก'),
  slipImage: z.string().min(1, 'ต้องแนบรูปสลิปโอนเงิน').url('ต้องเป็น URL ที่ถูกต้อง').refine(val => val.startsWith('https://'), 'อนุญาตเฉพาะ HTTPS URL เท่านั้น'),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  reason: z.string().optional(),
  action: z.enum(['request_reupload', 'cancel_booking']).optional(),
});
