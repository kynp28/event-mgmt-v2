import { OrganizerRequestRepository } from './organizer-request.repository';
import { AuthRepository } from '../auth/auth.repository';
import { prisma } from '../../config/prisma';
import { AppError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { RequestStatus } from '@prisma/client';

export class OrganizerRequestService {
  constructor(
    private readonly requestRepository = new OrganizerRequestRepository(),
    private readonly authRepository = new AuthRepository()
  ) {}

  async createRequest(userId: number, input: { feeAmount: number; invoicePath?: string }) {
    const existingRequests = await this.requestRepository.findRequestsByUserId(userId);
    const hasPending = existingRequests.some(r => r.status === 'pending');
    if (hasPending) {
      throw new ConflictError('คุณมีคำขอที่กำลังรอการอนุมัติอยู่แล้ว');
    }

    const userRoles = await this.authRepository.getUserRoles(userId);
    if (userRoles.includes('organizer')) {
      throw new ConflictError('คุณได้รับสิทธิ์เป็นผู้จัดงานแล้ว');
    }

    return this.requestRepository.createRequest({
      userId,
      ...input,
    });
  }

  async getMyRequests(userId: number) {
    return this.requestRepository.findRequestsByUserId(userId);
  }

  async getAllRequests(status?: string) {
    const validStatuses: RequestStatus[] = ['pending', 'approved', 'rejected'];
    let filterStatus: RequestStatus | undefined = undefined;
    
    if (status) {
      if (!validStatuses.includes(status as RequestStatus)) {
        throw new AppError('สถานะไม่ถูกต้อง', 400);
      }
      filterStatus = status as RequestStatus;
    }

    return this.requestRepository.findAllRequests(filterStatus);
  }

  async reviewRequest(requestId: number, status: 'approved' | 'rejected', adminId: number) {
    const request = await this.requestRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('ไม่พบคำขอ');
    }
    if (request.status !== 'pending') {
      throw new ConflictError(`คำขอนี้ถูกจัดการไปแล้ว (สถานะปัจจุบัน: ${request.status})`);
    }

    return prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.organizerRequest.update({
        where: { requestId },
        data: {
          status,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      if (status === 'approved') {
        const role = await tx.role.findUnique({ where: { roleName: 'organizer' } });
        if (role) {
          const existingUserRole = await tx.userRole.findFirst({
            where: { userId: request.userId, roleId: role.roleId }
          });
          if (!existingUserRole) {
            await tx.userRole.create({
              data: { userId: request.userId, roleId: role.roleId }
            });
          }
        }
      }

      return updatedRequest;
    });
  }
}
