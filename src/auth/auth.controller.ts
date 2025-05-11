import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAuthDto } from './dto/login-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import {
  ACCESS_TOKEN_MAX_AGE,
  getCookieOptions,
  REFRESH_TOKEN_MAX_AGE,
} from 'src/common/constant/cookieOption';
import { RequestWithUser } from 'types/user-request.interface';

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
  @ApiOperation({ summary: '로그인', description: '서비스에 로그인합니다.' })
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    // 쿠키 설정
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      // maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    // 쿠키가 설정되었는지 확인
    console.log('📍 Response headers:', res.getHeaders());

    // ✅ 응답 반환 추가
    return { success: true, message: '로그인 성공' };
  }

  // 🔴 로그아웃 (RefreshToken 무효화)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '서비스에서 로그아웃합니다.',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    const logout = await this.authService.logout(user.userId);

    // accessToken 쿠키 제거
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return logout;
  }

  // 🟡 access Token 재발급
  // @UseGuards(JwtAuthGuard)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({
    summary: '엑세스 토큰 갱신',
    description: '엑세스 토큰을 갱신하여 로그인을 지속시킵니다.',
  })
  async renewAccessToken(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // refresh token 추출
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken } = await this.authService.renewAccessToken(
      user.userId,
      refreshToken,
    );
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    if (accessToken) {
      console.log('🏅 accessToken renwed successfully');
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      return { success: true, message: 'Token refreshed' };
    } else {
      console.log('🏅 accessToken renwed successfully');
      res.clearCookie('accessToken', cookieOptions);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }
}
