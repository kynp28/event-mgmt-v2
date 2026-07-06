import { prisma } from '../../config/prisma';
import { Booth, Zone, Prisma } from '@prisma/client';

export class BoothRepository {
  async createZone(data: Prisma.ZoneUncheckedCreateInput): Promise<Zone> {
    return prisma.zone.create({ data });
  }

  async findZonesByEventId(eventId: number): Promise<Zone[]> {
    return prisma.zone.findMany({
      where: { eventId, deletedAt: null },
      include: { booths: { where: { deletedAt: null } } }
    });
  }

  async findZoneById(zoneId: number): Promise<Zone | null> {
    return prisma.zone.findFirst({ where: { zoneId, deletedAt: null } });
  }

  async updateZone(zoneId: number, data: Prisma.ZoneUncheckedUpdateInput): Promise<Zone> {
    return prisma.zone.update({ where: { zoneId }, data });
  }

  async softDeleteZone(zoneId: number): Promise<Zone> {
    return prisma.zone.update({ where: { zoneId }, data: { deletedAt: new Date() } });
  }

  async createBooth(data: Prisma.BoothUncheckedCreateInput): Promise<Booth> {
    return prisma.booth.create({ data });
  }

  async findBoothsByEventId(eventId: number): Promise<Booth[]> {
    return prisma.booth.findMany({
      where: { eventId, deletedAt: null },
      include: { zone: true }
    });
  }

  async findBoothById(boothId: number): Promise<Booth | null> {
    return prisma.booth.findFirst({ where: { boothId, deletedAt: null } });
  }

  async updateBooth(boothId: number, data: Prisma.BoothUncheckedUpdateInput): Promise<Booth> {
    return prisma.booth.update({ where: { boothId }, data });
  }

  async softDeleteBooth(boothId: number): Promise<Booth> {
    return prisma.booth.update({ where: { boothId }, data: { deletedAt: new Date() } });
  }
}
