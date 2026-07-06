import { BoothRepository } from './booth.repository';
import { EventRepository } from '../event/event.repository';
import { NotFoundError, ForbiddenError, ConflictError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';

export class BoothService {
  constructor(
    private readonly boothRepository = new BoothRepository(),
    private readonly eventRepository = new EventRepository()
  ) {}

  private async checkEventOwnership(eventId: number, organizerId: number) {
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) throw new NotFoundError('ไม่พบอีเวนต์');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์จัดการบูธในอีเวนต์นี้');
    }
    return event;
  }

  // --- Zones ---
  async createZone(organizerId: number, input: Prisma.ZoneUncheckedCreateInput) {
    await this.checkEventOwnership(input.eventId, organizerId);
    
    // Check duplicate zone name
    const existingZones = await this.boothRepository.findZonesByEventId(input.eventId);
    if (existingZones.some(z => z.zoneName === input.zoneName)) {
      throw new ConflictError(`โซนชื่อ ${input.zoneName} มีอยู่แล้วในอีเวนต์นี้`);
    }

    return this.boothRepository.createZone(input);
  }

  async getZonesByEvent(eventId: number) {
    return this.boothRepository.findZonesByEventId(eventId);
  }

  async updateZone(zoneId: number, organizerId: number, input: Prisma.ZoneUncheckedUpdateInput) {
    const zone = await this.boothRepository.findZoneById(zoneId);
    if (!zone) throw new NotFoundError('ไม่พบโซน');
    await this.checkEventOwnership(zone.eventId, organizerId);
    delete (input as any).eventId;
    return this.boothRepository.updateZone(zoneId, input);
  }

  async deleteZone(zoneId: number, organizerId: number) {
    const zone = await this.boothRepository.findZoneById(zoneId);
    if (!zone) throw new NotFoundError('ไม่พบโซน');
    await this.checkEventOwnership(zone.eventId, organizerId);
    return this.boothRepository.softDeleteZone(zoneId);
  }

  // --- Booths ---
  async createBooth(organizerId: number, input: Prisma.BoothUncheckedCreateInput) {
    await this.checkEventOwnership(input.eventId, organizerId);
    input.createdBy = organizerId;
    input.updatedBy = organizerId;
    return this.boothRepository.createBooth(input);
  }

  async getBoothsByEvent(eventId: number) {
    return this.boothRepository.findBoothsByEventId(eventId);
  }

  async updateBooth(boothId: number, organizerId: number, input: Prisma.BoothUncheckedUpdateInput) {
    const booth = await this.boothRepository.findBoothById(boothId);
    if (!booth) throw new NotFoundError('ไม่พบบูธ');
    await this.checkEventOwnership(booth.eventId, organizerId);
    input.updatedBy = organizerId;
    delete (input as any).eventId;
    return this.boothRepository.updateBooth(boothId, input);
  }

  async deleteBooth(boothId: number, organizerId: number) {
    const booth = await this.boothRepository.findBoothById(boothId);
    if (!booth) throw new NotFoundError('ไม่พบบูธ');
    await this.checkEventOwnership(booth.eventId, organizerId);
    return this.boothRepository.softDeleteBooth(boothId);
  }
}
