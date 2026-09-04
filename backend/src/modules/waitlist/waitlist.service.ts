import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';

export class WaitlistService {
  async joinWaitlist(vendorId: number, eventId: number, boothId: number) {
    const booth = await prisma.booth.findFirst({ where: { boothId, deletedAt: null } });
    if (!booth) throw new NotFoundError('ไม่พบบูธที่ระบุ');
    if (booth.eventId !== eventId) throw new ConflictError('บูธไม่ได้อยู่ในอีเวนต์ที่ระบุ');
    
    // Check if already in waitlist (เฉพาะสถานะ waiting เท่านั้น เพื่อให้ join ใหม่ได้หลัง cancel)
    const existing = await prisma.waitlist.findFirst({
      where: { vendorId, eventId, boothId, status: 'waiting' }
    });
    if (existing) throw new ConflictError('คุณอยู่ในคิวรอจองบูธนี้อยู่แล้ว');

    return prisma.waitlist.create({
      data: {
        vendorId,
        eventId,
        boothId,
        status: 'waiting'
      }
    });
  }

  async getWaitlistByEvent(eventId: number) {
    return prisma.waitlist.findMany({
      where: { eventId },
      include: {
        vendor: { select: { username: true, email: true } },
        booth: { select: { boothNo: true, price: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getMyWaitlist(vendorId: number) {
    return prisma.waitlist.findMany({
      where: { vendorId },
      include: {
        event: { select: { eventName: true, startDate: true, endDate: true } },
        booth: { select: { boothNo: true, price: true, lockState: true, lockedUntil: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
