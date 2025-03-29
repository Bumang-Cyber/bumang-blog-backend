import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAuthDto } from './dto/Login-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { RequestWithUser } from 'types/user-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🟢 회원가입
  @Post('signup')
  async signup(@Body() dto: SignupAuthDto) {
    return this.authService.signup(dto);
  }

  // 🔵 로그인 (Access + Refresh Token 발급)
  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  // 🟡 Refresh Token 재발급
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async renewRefresh(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.authService.refreshTokens(user.userId);
  }

  // 🔴 로그아웃 (RefreshToken 무효화)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.authService.logout(user.userId);
  }
}
