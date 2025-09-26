import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthenticatedUser } from './types/authenticated-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthenticatedUser(user);
  }

  async login(user: AuthenticatedUser): Promise<LoginResponseDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: this.getExpiresInSeconds(),
      user,
    };
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
    };
  }

  private getExpiresInSeconds(): number {
    const ttlRaw = this.configService.get<string>('JWT_ACCESS_TOKEN_TTL');
    if (!ttlRaw) {
      return 900;
    }

    const ttl = Number(ttlRaw);
    if (Number.isNaN(ttl)) {
      throw new Error(
        'JWT_ACCESS_TOKEN_TTL must be a number representing seconds.',
      );
    }

    return ttl;
  }
}
