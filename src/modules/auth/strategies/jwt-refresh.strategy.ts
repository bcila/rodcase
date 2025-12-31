import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenPayload } from '../token-payload.interface';
import { AuthService } from '../auth.service';
import { User } from '../../users/schema/user.schema';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (request: Request) => request.cookies?.Refresh,
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: RefreshTokenPayload,
  ): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rToken = request.cookies?.Refresh;

    if (!rToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return this.authService.verifyUserRefreshToken(rToken, payload.sub);
  }
}
