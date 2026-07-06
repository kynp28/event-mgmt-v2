import { z } from 'zod';

export const submitPaymentSchema = z.object({
  bookingId: z.number().int().positive('bookingId ต้องเป็นตัวเลขบวก'),
  slipImage: z.string().min(1, 'ต้องแนบรูปสลิปโอนเงิน'),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
});
