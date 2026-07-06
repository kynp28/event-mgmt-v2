import { PenaltyRepository } from './penalty.repository';
import { EventRepository } from '../event/event.repository';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { PenaltyStatus } from '@prisma/client';

export class PenaltyService {
  constructor(
    private readonly penaltyRepository = new PenaltyRepository(),
    private readonly eventRepository = new EventRepository()
  ) {}

  private async checkEventOwnership(eventId: number, organizerId: number) {
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) throw new NotFoundError('ไม่พบอีเวนต์');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์จัดการอีเวนต์นี้');
    }
  }

  async createPenalty(organizerId: number, vendorId: number, eventId: number, reason: string, fineAmount: number) {
    await this.checkEventOwnership(eventId, organizerId);
    return this.penaltyRepository.createPenalty({
      vendorId,
      eventId,
      reason,
      fineAmount,
      status: 'unpaid'
    });
  }

  async getVendorPenalties(vendorId: number) {
    return this.penaltyRepository.findPenaltiesByVendor(vendorId);
  }

  async getEventPenalties(organizerId: number, eventId: number) {
    await this.checkEventOwnership(eventId, organizerId);
    return this.penaltyRepository.findPenaltiesByEvent(eventId);
  }

  async updatePenaltyStatus(organizerId: number, penaltyId: number, status: PenaltyStatus) {
    const penalty = await this.penaltyRepository.findPenaltyById(penaltyId);
    if (!penalty) throw new NotFoundError('ไม่พบข้อมูลการลงโทษ');
    await this.checkEventOwnership(penalty.eventId, organizerId);

    return this.penaltyRepository.updatePenaltyStatus(penaltyId, status);
  }
}
