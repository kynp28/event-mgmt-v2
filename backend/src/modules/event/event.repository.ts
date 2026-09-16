import { prisma } from '../../config/prisma';
import { Event, Prisma } from '@prisma/client';

export class EventRepository {
  async createEvent(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async findEventById(eventId: number): Promise<any> {
    return prisma.event.findFirst({
      where: { eventId, deletedAt: null },
      include: { organizer: { select: { username: true, email: true, bankName: true, bankAccountNo: true, bankAccountName: true, promptpayNo: true } } }
    });
  }

  async findEvents(where: Prisma.EventWhereInput, skip?: number, take?: number): Promise<Event[]> {
    return prisma.event.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { 
        organizer: { select: { username: true } },
        booths: {
          where: { deletedAt: null },
          select: { status: true, lockState: true, price: true }
        }
      }
    });
  }

  async updateEvent(eventId: number, data: Prisma.EventUncheckedUpdateInput): Promise<Event> {
    return prisma.event.update({
      where: { eventId },
      data,
    });
  }

  async softDeleteEvent(eventId: number): Promise<Event> {
    return prisma.event.update({
      where: { eventId },
      data: { deletedAt: new Date() },
    });
  }
}
