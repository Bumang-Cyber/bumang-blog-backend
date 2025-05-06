import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RolesEnum } from 'src/users/const/roles.const';

interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   secretOrKey: process.env.JWT_SECRET,
    // });
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ✅ Authorization: Bearer ... 지원
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // ✅ httpOnly 쿠키 지원
        (req: RequestWithCookies) => req?.cookies?.['access_token'],
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: number; email: string; role: RolesEnum }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
