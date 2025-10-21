import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, password: hashedPassword });
    await this.usersRepo.save(user);
    return { message: 'User registered successfully' };
  }

  async login(email: string, password: string, ip: string, mac: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Update IP and MAC before returning the token
    user.ip = ip;
    user.mac = mac;
    await this.usersRepo.save(user);

    const payload = { sub: user.id.toString(), email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET')!,
      });
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
