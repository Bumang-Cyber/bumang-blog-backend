import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RolesEnum } from 'src/users/const/roles.const';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    console.log('🔄 JwtRefreshStrategy 생성자 호출됨');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['refreshToken'];
          console.log('🌍 Extracted refreshToken:', token);

          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true, // 이 옵션을 추가하여 요청 객체를 콜백에 전달
    });
    console.log(
      '🔑 JWT_REFRESH_SECRET 설정됨:',
      !!process.env.JWT_REFRESH_SECRET,
    );
  }

  async validate(payload: { sub: number; email: string; role: RolesEnum }) {
    try {
      console.log('💥 JwtRefreshStrategy.validate 호출됨');
      console.log('Payload:', payload);
      const result = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      console.log('Validation result:', result);
      return result;
    } catch (error) {
      console.error('Refresh token validation error:', error);
      throw error;
    }
  }
}

// async validate(payload: { sub: number; email: string; role: RolesEnum }) {
//   console.log('💥 JwtRefreshStrategy.validate 호출됨');
//   return { userId: payload.sub, email: payload.email, role: payload.role };
// }
