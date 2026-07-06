import { z } from 'zod';

export const createBookingSchema = z.object({
  eventId: z.number().int().positive('eventId ต้องเป็นตัวเลขบวก'),
  boothId: z.number().int().positive('boothId ต้องเป็นตัวเลขบวก'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']),
});
