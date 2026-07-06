import { z } from 'zod';

export const createEventSchema = z.object({
  eventName: z.string().min(1, 'ต้องระบุชื่ออีเวนต์'),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  startDate: z.string().datetime({ message: 'รูปแบบวันที่และเวลาไม่ถูกต้อง (ต้องเป็น ISO 8601 เช่น 2026-07-01T10:00:00Z)' }),
  endDate: z.string().datetime({ message: 'รูปแบบวันที่และเวลาไม่ถูกต้อง (ต้องเป็น ISO 8601 เช่น 2026-07-01T18:00:00Z)' }),
});

export const updateEventSchema = createEventSchema.partial().extend({
  eventStatus: z.enum(['draft', 'open', 'closed', 'ended', 'cancelled']).optional(),
});
