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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { RequestWithUser } from 'types/user-request.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';

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
    const { accessToken, refreshToken } = await this.authService.login(dto);

    // accessToken 쿠키 설정
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // CSRF 보호
      maxAge: 1000 * 60 * 15, // 15분
      path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
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
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    await this.authService.logout(user.userId);

    // accessToken 쿠키 제거
    res.clearCookie('accessToken', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      // sameSite: 'lax',
      sameSite: 'none',
      path: '/', // ✅ 원래 설정한 path와 일치해야 삭제됨
    });
  }

  // 🟡 access Token 재발급
  // @UseGuards(JwtAuthGuard)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(204)
  @ApiOperation({
    summary: '엑세스 토큰 갱신',
    description: '엑세스 토큰을 갱신하여 로그인을 지속시킵니다.',
  })
  async renewAccessToken(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    console.log('---PASS---');
    console.log(user, 'user');
    const { accessToken } = await this.authService.renewAccessToken(
      user.userId,
    );

    if (accessToken) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // CSRF 보호
        maxAge: 1000 * 60 * 15, // 15분
        path: '/',
      });
    } else {
      console.log('error');
      res.cookie('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // CSRF 보호
        expires: new Date(0),
        path: '/',
      });
    }
  }
}
