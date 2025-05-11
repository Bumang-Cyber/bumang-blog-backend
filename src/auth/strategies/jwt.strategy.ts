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
          console.log('🥎 Extracted accessToken:', token);

          // 토큰 디코딩 (검증 없이)
          if (token) {
            try {
              const decoded = jwt.decode(token);
              console.log('📋 Decoded token (without verify):', decoded);

              // 토큰 검증
              const verified = jwt.verify(token, process.env.JWT_SECRET);
              console.log('✅ Token verified manually:', verified);
            } catch (error) {
              console.error('❌ Token verification error:', error.message);
            }
          }

          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false, // 만료된 토큰 거부 (기본값)
      // passReqToCallback: false, // 기본값
    });
  }

  async validate(payload: any) {
    console.log('❣️ validated value', {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
