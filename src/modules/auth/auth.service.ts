import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';
import { User } from '../users/schema/user.schema';
import { CreateUserRequest } from '../users/dto/create-user.request';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const tokenPayload: TokenPayload = {
      sub: user._id.toHexString(),
      email: user.email,
      role: user.role,
    };

    const ACCESS_TOKEN_EXPIRE_SECONDS: number = 15 * 60; // 15 min
    const REFRESH_TOKEN_EXPIRE_SECONDS: number = 7 * 24 * 60 * 60; // 7 days

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRE_SECONDS,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_EXPIRE_SECONDS,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: ACCESS_TOKEN_EXPIRE_SECONDS * 1000,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: REFRESH_TOKEN_EXPIRE_SECONDS * 1000,
    });
  }

  async register(dto: CreateUserRequest) {
    await this.usersService.create(dto);
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.passwordHash);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ _id: userId });
      const rToken = user.refreshToken !== undefined ? user.refreshToken : '';
      const authenticated = await compare(refreshToken, rToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
