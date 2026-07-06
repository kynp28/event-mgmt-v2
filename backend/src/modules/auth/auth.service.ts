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

    const token = signToken({ userId: user.userId, roles });

    return {
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
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
      throw new ForbiddenError('บัญชีนี้ถูกระงับการใช้งาน');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const roles = await this.authRepository.getUserRoles(user.userId);
    const token = signToken({ userId: user.userId, roles });

    return {
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roles,
      },
    };
  }
}