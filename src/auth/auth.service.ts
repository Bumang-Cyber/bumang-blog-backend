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
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    // 토큰 생성 (userId와 role 기록)
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.role);

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
      throw new UnauthorizedException('Invalid Refresh token');
    }

    // 토큰 재발급
    const accessToken = this.generateAccessToken(userId, RolesEnum.ADMIN);
    const refreshToken = this.generateRefreshToken(userId, RolesEnum.ADMIN);

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
    return { message: 'logout successfully completed' };
  }

  // 🔑 Access Token 생성
  private generateAccessToken(userId: number, role: RolesEnum): string {
    return this.jwtService.sign(
      {
        sub: userId,
        role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      },
    );
  }

  // 🔑 Refresh Token 생성
  private generateRefreshToken(userId: number, role: RolesEnum): string {
    return this.jwtService.sign(
      {
        sub: userId,
        role,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );
  }
}
