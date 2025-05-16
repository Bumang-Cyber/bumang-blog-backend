import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { getCookieOptions } from 'src/common/constant/cookieOption';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService, // 사용자 관련 서비스
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 기본 JWT 검증 시도
      const result = await super.canActivate(context);

      if (!result) {
        this.clearAuthCookies(context);
        return false;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const refreshToken = this.extractTokenFromCookie(request, 'refreshToken');

      // 토큰 검증 로직 (예: DB에 저장된 토큰과 비교)
      const isValid = await this.userService.validateRefreshToken(
        user.userId,
        refreshToken,
      );

      if (!isValid) {
        // 유효하지 않은 토큰인 경우 해당 토큰 삭제
        console.log(user.userId, 'user.id 🛵');
        await this.userService.removeRefreshToken(user.userId);
        this.clearAuthCookies(context);
        return false;
      }

      return true;
    } catch (error) {
      // 오류 발생 시 토큰 삭제 시도
      try {
        const request = context.switchToHttp().getRequest();
        const payload = this.extractPayloadFromToken(request);

        if (payload && payload.sub) {
          await this.userService.removeRefreshToken(payload.sub);
        }
      } catch (innerError) {
        // 토큰에서 사용자 ID를 추출할 수 없는 경우 무시
      }

      throw error;
    }
  }

  private extractTokenFromCookie(
    request: Request,
    cookieName: string,
  ): string | undefined {
    if (request?.['cookie'] && request?.['cookie'][cookieName]) {
      return request?.['cookie'][cookieName];
    }
    return undefined;
  }

  private clearAuthCookies(context: ExecutionContext): void {
    const res = context.switchToHttp().getResponse();
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    // 인증 관련 쿠키 모두 삭제 (accessToken, refreshToken)
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }

  private extractPayloadFromToken(request: Request): any {
    try {
      const token = this.extractTokenFromCookie(request, 'refreshToken');
      if (!token) return null;

      // JWT 디코딩 (verify 없이 payload만 추출)
      const base64Payload = token.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString();
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
