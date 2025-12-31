import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../token-payload.interface';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract JWT from Authentication cookie
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    // After token validation, fetch the user from payload data
    return this.usersService.getUser({ _id: payload.sub });
  }
}
