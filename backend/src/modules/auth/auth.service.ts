import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validator';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../common/errors/AppError';
import { signToken } from '../../common/utils/jwt';

export interface AuthResult {
  token: string;
  user: {
    userId: number;
    username: string;
    email: string;
    avatarUrl?: string | null;
    roles: string[];
  };
}

// Service Layer: เก็บ business logic ทั้งหมด — ไม่รู้จัก req/res ของ Express
// และไม่เขียน SQL ตรงๆ (เรียกผ่าน Repository เท่านั้น) ทำให้ทดสอบได้ง่ายด้วย unit test
export class AuthService {
  constructor(private readonly authRepository: AuthRepository = new AuthRepository()) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.authRepository.createUser({
      username: input.username,
      email: input.email,
      passwordHash,
    });

    await this.authRepository.assignRole(user.userId, input.role);
    const roles = await this.authRepository.getUserRoles(user.userId);

    const token = signToken({ userId: user.userId, username: user.username, roles });

    return {
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('บัญชีนี้ถูกระงับการใช้งาน', { 
        isSuspended: true, 
        suspendReason: user.suspendReason 
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const roles = await this.authRepository.getUserRoles(user.userId);
    const token = signToken({ userId: user.userId, username: user.username, roles });

    return {
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('ไม่พบข้อมูลผู้ใช้');
    }

    const roles = await this.authRepository.getUserRoles(user.userId);
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      roles,
    };
  }

  async updateProfile(userId: number, input: {
    username?: string;
    avatarUrl?: string | null;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<AuthResult> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('ไม่พบข้อมูลผู้ใช้');
    }

    const updateData: { username?: string; avatarUrl?: string | null; passwordHash?: string } = {};

    if (input.username !== undefined && input.username.trim()) {
      updateData.username = input.username.trim();
    }

    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl;
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new UnauthorizedError('กรุณาระบุรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่าน');
      }
      const isCurrentValid = await argon2.verify(user.passwordHash, input.currentPassword);
      if (!isCurrentValid) {
        throw new UnauthorizedError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      }
      if (input.newPassword.length < 8) {
        throw new ConflictError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      }
      updateData.passwordHash = await argon2.hash(input.newPassword);
    }

    const updatedUser = await this.authRepository.updateUser(userId, updateData);
    const roles = await this.authRepository.getUserRoles(userId);
    const token = signToken({ userId: updatedUser.userId, username: updatedUser.username, roles });

    return {
      token,
      user: {
        userId: updatedUser.userId,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        roles,
      },
    };
  }

  async submitAppeal(email: string, reason: string, evidenceUrl?: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user || user.status !== 'suspended') {
      return;
    }

    const existingAppeal = await this.authRepository.findPendingAppeal(user.userId);
    if (existingAppeal) {
      return;
    }

    await this.authRepository.createAppeal(user.userId, reason, evidenceUrl);
  }
}