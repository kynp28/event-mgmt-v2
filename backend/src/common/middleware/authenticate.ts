import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../errors/AppError';
import { prisma } from '../../config/prisma';
import { AuthRepository } from '../../modules/auth/auth.repository';

const authRepository = new AuthRepository();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { roles?: string[] };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findFirst({
      where: {
        userId: payload.userId,
        deletedAt: null,
        status: 'active',
      },
    });

    if (!user) {
      res.clearCookie('token');
      throw new UnauthorizedError('User is no longer active or has been deleted');
    }

    req.user = {
      userId: user.userId,
      username: user.username,
      roles: await authRepository.getUserRoles(user.userId),
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Token ไม่ถูกต้องหรือหมดอายุ'));
  }
};