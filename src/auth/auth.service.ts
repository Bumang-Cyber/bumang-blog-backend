import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/Login-auth.dto';
import { RolesEnum } from 'src/users/const/roles.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupAuthDto) {
    const { email, nickname, password } = dto;

    // 이메일 조회
    const existingEmail = await this.usersService.findOneUserByEmail(email);
    if (existingEmail) {
      throw new ConflictException('User with this Email already exists');
    }

    // 닉네임 조회
    const existingNickname =
      await this.usersService.findOneUserByNickname(nickname);
    if (existingNickname) {
      throw new ConflictException('User with this Nickname already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.createUser({
      email,
      nickname,
      role: RolesEnum.USER,
      password: hashedPassword,
    });

    return { message: 'Sign-up successfully completed.', userId: newUser.id };
  }

  // 🔵 로그인 (Access + Refresh Token 발급)
  async login(dto: LoginAuthDto) {
    const { email, password } = dto;

    const user = await this.usersService.findOneUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 일치하지 않습니다.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 일치하지 않습니다.',
      );
    }

    // 토큰 생성
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Refresh Token DB에 저장
    await this.usersService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 🟡 Refresh Token 재발급
  async refreshTokens(userId: number) {
    const user = await this.usersService.findOneUserById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token이 유효하지 않습니다.');
    }

    // 토큰 재발급
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // DB에 refreshToken 갱신
    await this.usersService.saveRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 🔴 로그아웃
  async logout(userId: number) {
    await this.usersService.removeRefreshToken(userId);
    return { message: '성공적으로 로그아웃되었습니다.' };
  }

  // 🔑 Access Token 생성
  private generateAccessToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      },
    );
  }

  // 🔑 Refresh Token 생성
  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );
  }
}
