import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies) => {
          const token = req?.cookies?.['refreshToken'];
          console.log('🌍 Extracted refreshToken:', token);

          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('💥 JwtRefreshStrategy.validate 호출됨');
    console.log('payload:', payload.sub, payload.email, payload.role);
    console.log('----------------------------------------');
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
