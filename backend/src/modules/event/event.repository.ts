import { prisma } from '../../config/prisma';
import { Event, Prisma } from '@prisma/client';

export class EventRepository {
  async createEvent(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async findEventById(eventId: number): Promise<Event | null> {
    return prisma.event.findFirst({
      where: { eventId, deletedAt: null },
      include: { organizer: { select: { username: true, email: true } } }
    });
  }

  async findEvents(where: Prisma.EventWhereInput): Promise<Event[]> {
    return prisma.event.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { 
        organizer: { select: { username: true } },
        _count: {
          select: {
            booths: { where: { status: 'available', deletedAt: null } }
          }
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
