import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../common/errors/AppError';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';

jest.mock('./auth.repository');

// สร้าง mock user ที่มี type ตรงกับ Prisma User model
const mockUser = (overrides: Partial<User> = {}): User => ({
  userId: 1,
  username: 'testuser',
  email: 'test@test.com',
  passwordHash: 'hashed',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    authService = new AuthService(mockRepository);
  });

  describe('register', () => {
    it('should throw ConflictError if email already exists', async () => {
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(mockUser());

      await expect(
        authService.register({
          username: 'testuser',
          email: 'existing@test.com',
          password: 'password123',
          role: 'vendor',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should hash password and create user with assigned role', async () => {
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(null as unknown as User);
      mockRepository.createUser = jest.fn().mockResolvedValue(mockUser());
      mockRepository.assignRole = jest.fn().mockResolvedValue(undefined);
      mockRepository.getUserRoles = jest.fn().mockResolvedValue(['vendor']);

      const result = await authService.register({
        username: 'testuser',
        email: 'new@test.com',
        password: 'password123',
        role: 'vendor',
      });

      expect(mockRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com' })
      );
      expect(mockRepository.assignRole).toHaveBeenCalledWith(1, 'vendor');
      expect(result.user.roles).toEqual(['vendor']);
      expect(result.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError if user does not exist', async () => {
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(null as unknown as User);

      await expect(
        authService.login({ email: 'notfound@test.com', password: 'password123' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError if account is suspended', async () => {
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(
        mockUser({ status: 'suspended', passwordHash: await argon2.hash('password123') })
      );

      await expect(
        authService.login({ email: 'suspended@test.com', password: 'password123' })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(
        mockUser({ passwordHash: await argon2.hash('correctpassword') })
      );

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should return token and user info on successful login', async () => {
      const passwordHash = await argon2.hash('password123');
      mockRepository.findUserByEmail = jest.fn().mockResolvedValue(
        mockUser({ passwordHash })
      );
      mockRepository.getUserRoles = jest.fn().mockResolvedValue(['organizer']);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.roles).toEqual(['organizer']);
    });
  });
});