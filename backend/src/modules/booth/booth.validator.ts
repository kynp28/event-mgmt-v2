import { z } from 'zod';

export const createZoneSchema = z.object({
  eventId: z.number().int().positive(),
  zoneName: z.string().min(1, 'ต้องระบุชื่อโซน'),
  color: z.string().optional(),
});

export const updateZoneSchema = createZoneSchema.partial();

export const createBoothSchema = z.object({
  eventId: z.number().int().positive(),
  zoneId: z.number().int().positive().optional(),
  boothNo: z.string().min(1, 'ต้องระบุหมายเลขบูธ'),
  size: z.string().optional(),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  isAuctionBooth: z.boolean().optional(),
  posX: z.number().int().optional(),
  posY: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const updateBoothSchema = createBoothSchema.partial();
