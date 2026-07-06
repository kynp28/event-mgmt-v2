import { prisma } from '../../config/prisma';
import { Penalty, PenaltyStatus, Prisma } from '@prisma/client';

export class PenaltyRepository {
  async createPenalty(data: Prisma.PenaltyUncheckedCreateInput): Promise<Penalty> {
    return prisma.penalty.create({ data });
  }

  async findPenaltyById(penaltyId: number) {
    return prisma.penalty.findUnique({
      where: { penaltyId },
      include: { event: true, vendor: { select: { username: true, email: true } } }
    });
  }

  async findPenaltiesByVendor(vendorId: number) {
    return prisma.penalty.findMany({
      where: { vendorId },
      include: { event: { select: { eventName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findPenaltiesByEvent(eventId: number) {
    return prisma.penalty.findMany({
      where: { eventId },
      include: { vendor: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePenaltyStatus(penaltyId: number, status: PenaltyStatus): Promise<Penalty> {
    return prisma.penalty.update({
      where: { penaltyId },
      data: { status }
    });
  }
}
