import { Request, Response } from 'express';
import { BoothService } from './booth.service';

export class BoothController {
  constructor(private readonly boothService = new BoothService()) {}

  // --- Zones ---
  createZone = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.boothService.createZone(organizerId, req.body);
    res.status(201).json({ message: 'สร้างโซนสำเร็จ', data: result });
  };

  getZones = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId as string, 10);
    const result = await this.boothService.getZonesByEvent(eventId);
    res.status(200).json({ data: result });
  };

  updateZone = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const zoneId = parseInt(req.params.id as string, 10);
    const result = await this.boothService.updateZone(zoneId, organizerId, req.body);
    res.status(200).json({ message: 'อัปเดตโซนสำเร็จ', data: result });
  };

  deleteZone = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const zoneId = parseInt(req.params.id as string, 10);
    await this.boothService.deleteZone(zoneId, organizerId);
    res.status(200).json({ message: 'ลบโซนสำเร็จ' });
  };

  // --- Booths ---
  createBooth = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const result = await this.boothService.createBooth(organizerId, req.body);
    res.status(201).json({ message: 'สร้างบูธสำเร็จ', data: result });
  };

  getBooths = async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId as string, 10);
    const result = await this.boothService.getBoothsByEvent(eventId);
    res.status(200).json({ data: result });
  };

  updateBooth = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const boothId = parseInt(req.params.id as string, 10);
    const result = await this.boothService.updateBooth(boothId, organizerId, req.body);
    res.status(200).json({ message: 'อัปเดตบูธสำเร็จ', data: result });
  };

  deleteBooth = async (req: Request, res: Response) => {
    const organizerId = req.user!.userId;
    const boothId = parseInt(req.params.id as string, 10);
    await this.boothService.deleteBooth(boothId, organizerId);
    res.status(200).json({ message: 'ลบบูธสำเร็จ' });
  };
}
