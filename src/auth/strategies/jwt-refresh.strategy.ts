import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['refreshToken'];
          console.log('🔥 Extracted refreshToken:', token);
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(
//   Strategy,
//   'jwt-refresh',
// ) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_REFRESH_SECRET,
//       // passReqToCallback: true,
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub, email: payload.email, role: payload.role };
//   }
// }
