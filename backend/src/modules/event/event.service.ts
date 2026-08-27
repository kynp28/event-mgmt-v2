import { EventRepository } from './event.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../common/errors/AppError';
import { EventStatus, Prisma } from '@prisma/client';

export class EventService {
  constructor(private readonly eventRepository = new EventRepository()) {}

  async createEvent(organizerId: number, input: {
    eventName: string;
    description?: string;
    location?: string;
    imageUrl?: string;
    invoiceUrl?: string;
    startDate: string;
    endDate: string;
  }) {
    if (new Date(input.startDate) >= new Date(input.endDate)) {
      throw new ValidationError('วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น');
    }

    return this.eventRepository.createEvent({
      organizerId,
      eventName: input.eventName,
      description: input.description,
      location: input.location,
      imageUrl: input.imageUrl,
      invoiceUrl: input.invoiceUrl,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    });
  }

  private mapBoothStats(event: any) {
    if (!event) return event;
    const now = new Date();
    const isEnded = new Date(event.endDate) < now;
    let dynamicStatus = event.eventStatus;
    if (isEnded && (event.eventStatus === 'open' || event.eventStatus === 'closed')) {
      dynamicStatus = 'ended';
    }

    const total = event.booths ? event.booths.length : 0;
    const available = isEnded ? 0 : (event.booths ? event.booths.filter((b: any) => b.status === 'available' && b.lockState === 'none').length : 0);
    const booked = event.booths ? event.booths.filter((b: any) => b.status === 'booked').length : 0;
    
    const { booths, ...rest } = event;
    return {
      ...rest,
      eventStatus: dynamicStatus,
      isEnded,
      boothStats: { total, available, booked }
    };
  }

  async getEventsByOrganizer(organizerId: number, skip: number = 0, take: number = 50) {
    const events = await this.eventRepository.findEvents({ organizerId }, skip, take);
    return events.map((e) => this.mapBoothStats(e));
  }

  async getActiveEvents(skip: number = 0, take: number = 50) {
    const events = await this.eventRepository.findEvents({
      eventStatus: { in: ['open', 'closed', 'ended'] },
    }, skip, take);
    return events.map((e) => this.mapBoothStats(e));
  }

  async getEventById(eventId: number) {
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) {
      throw new NotFoundError('ไม่พบอีเวนต์');
    }
    const isEnded = new Date(event.endDate) < new Date();
    let dynamicStatus = event.eventStatus;
    if (isEnded && (event.eventStatus === 'open' || event.eventStatus === 'closed')) {
      dynamicStatus = 'ended';
    }
    return {
      ...event,
      eventStatus: dynamicStatus,
      isEnded
    };
  }

  async updateEvent(
    eventId: number, 
    organizerId: number, 
    input: {
      eventName?: string;
      description?: string;
      location?: string;
      imageUrl?: string | null;
      invoiceUrl?: string | null;
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
    if (input.description !== undefined) updateData.description = input.description;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.invoiceUrl !== undefined) updateData.invoiceUrl = input.invoiceUrl;
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
