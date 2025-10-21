import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      usersRepo.findOne.mockResolvedValue({ email: 'test@test.com' });

      await expect(
        service.register('test@test.com', 'password'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and save a new user', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      usersRepo.create.mockImplementation((dto) => dto);
      usersRepo.save.mockResolvedValue({ id: 1, email: 'test@test.com' });
      //jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.register('test@test.com', 'password');

      expect(usersRepo.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashedPassword',
      });
      expect(usersRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login('test@test.com', 'password', 'ip', 'mac'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      //jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login('test@test.com', 'wrongpass', 'ip', 'mac'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token on successful login', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      //jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');
      usersRepo.save.mockResolvedValue(true);

      const result = await service.login(
        'test@test.com',
        'password',
        '127.0.0.1',
        'mac',
      );

      expect(usersRepo.save).toHaveBeenCalledWith({
        ...mockUser,
        ip: '127.0.0.1',
        mac: 'mac',
      });
      expect(result).toEqual({ access_token: 'token' });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify token successfully', () => {
      jwtService.verify.mockReturnValue({ sub: '1', email: 'test@test.com' });

      const result = service.verifyAccessToken('token');

      expect(result).toEqual({ sub: '1', email: 'test@test.com' });
      expect(jwtService.verify).toHaveBeenCalledWith('token', {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException on invalid token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => service.verifyAccessToken('token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
