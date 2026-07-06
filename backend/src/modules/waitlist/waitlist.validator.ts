import { z } from 'zod';

export const joinWaitlistSchema = z.object({
  eventId: z.number().int().positive('eventId ต้องเป็นตัวเลขบวก'),
  boothId: z.number().int().positive('boothId ต้องเป็นตัวเลขบวก'),
});
