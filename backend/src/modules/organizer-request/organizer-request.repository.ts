import { prisma } from '../../config/prisma';
import { OrganizerRequest, RequestStatus } from '@prisma/client';

export class OrganizerRequestRepository {
  async createRequest(data: { userId: number; feeAmount: number; invoicePath?: string }): Promise<OrganizerRequest> {
    return prisma.organizerRequest.create({
      data: {
        userId: data.userId,
        feeAmount: data.feeAmount,
        invoicePath: data.invoicePath,
      },
    });
  }

  async findRequestById(requestId: number): Promise<OrganizerRequest | null> {
    return prisma.organizerRequest.findFirst({
      where: { requestId, deletedAt: null },
      include: { user: { select: { email: true, username: true } } },
    });
  }

  async findRequestsByUserId(userId: number): Promise<OrganizerRequest[]> {
    return prisma.organizerRequest.findMany({
      where: { userId, deletedAt: null },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findAllRequests(status?: RequestStatus): Promise<OrganizerRequest[]> {
    return prisma.organizerRequest.findMany({
      where: status ? { status, deletedAt: null } : { deletedAt: null },
      include: { user: { select: { email: true, username: true } } },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async updateRequestStatus(
    requestId: number, 
    status: RequestStatus, 
    reviewedBy: number
  ): Promise<OrganizerRequest> {
    return prisma.organizerRequest.update({
      where: { requestId },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }
}
