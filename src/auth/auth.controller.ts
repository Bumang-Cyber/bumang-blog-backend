import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { RequestWithUser } from 'types/user-request.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Auth') // Swagger UI 그룹 이름
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🟢 회원가입
  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 유저 회원가입' })
  async signup(@Body() dto: SignupAuthDto) {
    return await this.authService.signup(dto);
  }

  // 🔵 로그인 (Access + Refresh Token 발급, 204)
  @Post('login')
  @HttpCode(204)
  @ApiOperation({ summary: '로그인', description: '서비스에 로그인합니다.' })
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.login(dto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CSRF 보호
      maxAge: 1000 * 60 * 15, // 15분
      path: '/',
    });
  }

  // 🔴 로그아웃 (RefreshToken 무효화)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '서비스에서 로그아웃합니다.',
  })
  async logout(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.authService.logout(user.userId);
  }

  // 🟡 access Token 재발급
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @Post('logout')
  @ApiOperation({
    summary: '엑세스 토큰 갱신',
    description: '엑세스 토큰을 갱신하여 로그인을 지속시킵니다.',
  })
  async renewAccessToken(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.authService.renewAccessToken(user.userId);
  }
}
