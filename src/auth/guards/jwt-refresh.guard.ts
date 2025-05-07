import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
    console.log('🧩 JwtRefreshGuard instance:', this);
  }

  canActivate(context: ExecutionContext) {
    console.log('🛡 JwtRefreshGuard 실행');
    try {
      return super.canActivate(context);
    } catch (error) {
      console.error('JwtRefreshGuard error:', error);
      throw error;
    }
  }
}
