import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RolesEnum } from 'src/users/const/roles.const';
import { AppLoggerService } from 'src/logger/app-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appLoggerService: AppLoggerService,
  ) {}

  async signup(dto: SignupAuthDto) {
    const { email, nickname, password } = dto;

    // 이메일 조회
    const isEmailAvailable = await this.usersService.isEmailAvailable(email);
    if (!isEmailAvailable) {
      throw new ConflictException('User with this Email already exists');
    }

    // 닉네임 조회
    const isNicknameAvailable =
      await this.usersService.isNicknameAvailable(nickname);
    if (!isNicknameAvailable) {
      throw new ConflictException('User with this Nickname already exists');
    }

    const newUser = await this.usersService.createUser({
      email,
      nickname,
      role: RolesEnum.USER,
      password,
    });

    return { message: 'Sign-up successfully completed.', userId: newUser.id };
  }

  // 🔵 로그인 (Access + Refresh Token 발급)
  async login(dto: LoginAuthDto) {
    const { email, password } = dto;

    const user = await this.usersService.validateOneUserPasswordByEmail(email);
    if (!user) {
      this.appLoggerService.logAuth(
        'login_user_not_found',
        undefined,
        email,
        false,
      );
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      this.appLoggerService.logAuth(
        'login_password_mismatch',
        user.id,
        email,
        false,
      );
      throw new UnauthorizedException('Invalid Email or Password');
    }

    // 토큰 생성 (userId와 role 기록)
    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.email,
      user.role,
    );

    // Refresh Token DB에 저장
    await this.usersService.saveRefreshToken(user.id, refreshToken);

    this.appLoggerService.logAuth('login_success', user.id, email, true);

    return { accessToken, refreshToken, user };
  }

  // 🟡 access Token 재발급
  async renewAccessToken(userId: number, currentRefreshToken: string) {
    console.log('✈️ 1');
    const user = await this.usersService.validateOneUserById(userId);
    console.log('✈️ 2');
    if (!user.refreshToken) {
      console.log('✈️ 3');
      return {
        accessToken: false,
      };
    }

    console.log('✈️ 4');
    // 토큰 재발급
    const accessToken = this.generateAccessToken(userId, user.email, user.role);

    console.log('✈️ 5');
    // DB의 refresh token과 현재 토큰 비교
    if (!user.refreshToken || user.refreshToken !== currentRefreshToken) {
      console.log('✈️ 6');

      await this.usersService.removeRefreshToken(user.id);

      return {
        accessToken: false,
      };
    }

    // Refresh token 만료 확인 (선택적)
    try {
      console.log('✈️ 7');

      this.jwtService.verify(currentRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      console.log('✈️ 8');
    } catch (error) {
      console.log('✈️ 9');
      console.log(error, 'error');
      return {
        accessToken: false,
      };
    }

    return {
      accessToken,
      // refreshToken,
    };
  }

  // 🔴 로그아웃
  async logout(userId: number) {
    await this.usersService.removeRefreshToken(userId);

    return { message: 'logout successfully completed' };
  }

  // 🔑 Access Token 생성
  private generateAccessToken(
    userId: number,
    email: string,
    role: RolesEnum,
  ): string {
    return this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      },
    );
  }

  // 🔑 Refresh Token 생성
  private generateRefreshToken(
    userId: number,
    email: string,
    role: RolesEnum,
  ): string {
    return this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );
  }
}
