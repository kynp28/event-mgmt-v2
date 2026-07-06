import { EventRepository } from './event.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../common/errors/AppError';
import { EventStatus, Prisma } from '@prisma/client';

export class EventService {
  constructor(private readonly eventRepository = new EventRepository()) {}

  async createEvent(organizerId: number, input: {
    eventName: string;
    location?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
  }) {
    if (new Date(input.startDate) >= new Date(input.endDate)) {
      throw new ValidationError('วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น');
    }

    return this.eventRepository.createEvent({
      organizerId,
      eventName: input.eventName,
      location: input.location,
      imageUrl: input.imageUrl,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    });
  }

  async getEventsByOrganizer(organizerId: number) {
    return this.eventRepository.findEvents({ organizerId });
  }

  async getActiveEvents() {
    return this.eventRepository.findEvents({
      eventStatus: { in: ['open', 'closed'] },
    });
  }

  async getEventById(eventId: number) {
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundError('ไม่พบอีเวนต์');
    }
    return event;
  }

  async updateEvent(
    eventId: number, 
    organizerId: number, 
    input: {
      eventName?: string;
      location?: string;
      imageUrl?: string;
      startDate?: string;
      endDate?: string;
      eventStatus?: EventStatus;
    }
  ) {
    const event = await this.getEventById(eventId);
    
    // Check ownership
    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์แก้ไขอีเวนต์นี้');
    }

    // Validate dates if both or either are provided
    const newStartDate = input.startDate ? new Date(input.startDate) : event.startDate;
    const newEndDate = input.endDate ? new Date(input.endDate) : event.endDate;
    if (newStartDate >= newEndDate) {
      throw new ValidationError('วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น');
    }

    const updateData: Prisma.EventUncheckedUpdateInput = {};
    if (input.eventName !== undefined) updateData.eventName = input.eventName;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.startDate !== undefined) updateData.startDate = newStartDate;
    if (input.endDate !== undefined) updateData.endDate = newEndDate;
    if (input.eventStatus !== undefined) updateData.eventStatus = input.eventStatus;

    return this.eventRepository.updateEvent(eventId, updateData);
  }

  async deleteEvent(eventId: number, organizerId: number) {
    const event = await this.getEventById(eventId);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('คุณไม่มีสิทธิ์ลบอีเวนต์นี้');
    }
    
    return this.eventRepository.softDeleteEvent(eventId);
  }
}
