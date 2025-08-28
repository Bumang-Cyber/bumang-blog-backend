import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';

interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ✅ Authorization: Bearer ... 지원
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // ✅ httpOnly 쿠키 지원
        (req: RequestWithCookies) => {
          const token = req?.cookies?.['accessToken'];

          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false, // 만료된 토큰 거부 (기본값)
      // passReqToCallback: false, // 기본값
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
