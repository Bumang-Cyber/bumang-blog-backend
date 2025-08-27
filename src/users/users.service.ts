import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { PostEntity } from 'src/posts/entities/post.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDetailResponseDto } from './dto/user-detail-response.dto';
import * as bcrypt from 'bcrypt';
import { AppLoggerService } from 'src/logger/app-logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,

    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,

    private readonly appLoggerService: AppLoggerService,
  ) {}

  // 전체 유저 조회
  async findAllUser(): Promise<UserEntity[]> {
    return this.userRepo.find({
      relations: ['posts', 'comments'], // 옵션
    });
  }

  // 특정 유저 조회 (아이디로)
  async findOneUserById(id: number): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with this ID does not exist`); // 404 에러를 던져줌
    }

    // 연결된 관계가 혹여 없다고 해도 에러가 나지 않고 0이 나옴.
    const [postsCount, commentsCount] = await Promise.all([
      this.postRepo.count({
        where: { author: { id: user.id } },
      }),
      this.commentRepo.count({
        where: { author: { id: user.id } },
      }),
    ]);

    return UserDetailResponseDto.fromEntity(user, postsCount, commentsCount);
  }

  // 특정 유저 조회 (아이디로)
  async validateOneUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with this ID does not exist`); // 404 에러를 던져줌
    }

    return user;
  }

  // 특정 유저 조회 (이메일로)
  async findOneUserByEmail(email: string): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with this Email does not exist`); // 404 에러를 던져줌
    }

    // 연결된 관계가 혹여 없다고 해도 에러가 나지 않고 0이 나옴.
    const [postsCount, commentsCount] = await Promise.all([
      this.postRepo.count({
        where: { author: { id: user.id } },
      }),
      this.commentRepo.count({
        where: { author: { id: user.id } },
      }),
    ]);

    return UserDetailResponseDto.fromEntity(user, postsCount, commentsCount);
  }

  // 특정 유저 조회 (이메일로, 비밀번호, 리프레시토큰 포함)
  async validateOneUserPasswordByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`User with this Email does not exist`); // 404 에러를 던져줌
    }

    return user;
  }

  // 특정 유저 조회 (닉네임으로)
  async findOneUserByNickname(
    nickname: string,
  ): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findOne({
      where: { nickname },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new UnauthorizedException(`User with this Email does not exist`); // 404 에러를 던져줌
    }

    // 연결된 관계가 혹여 없다고 해도 에러가 나지 않고 0이 나옴.
    const [postsCount, commentsCount] = await Promise.all([
      this.postRepo.count({
        where: { author: { id: user.id } },
      }),
      this.commentRepo.count({
        where: { author: { id: user.id } },
      }),
    ]);

    return UserDetailResponseDto.fromEntity(user, postsCount, commentsCount);
  }

  // 사용가능한 이메일인지 여부
  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    return !user;
  }

  // 사용가능한 닉네임인지 여부
  async isNicknameAvailable(nickname: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { nickname },
    });

    return !user;
  }

  // 유저 생성
  async createUser(dto: CreateUserDto): Promise<UserDetailResponseDto> {
    const { email, nickname, password } = dto;

    // Promise.all로 동시 조회
    const [existingEmail, existingNickname] = await Promise.all([
      this.userRepo.findOne({ where: { email } }),
      this.userRepo.findOne({ where: { nickname } }),
    ]);

    if (existingEmail) {
      this.appLoggerService.logUser(
        'user_not_created_existing_email',
        undefined,
        email,
        false,
      );
      throw new ConflictException('this email has already been used'); // 409 에러를 던져줌
    }
    if (existingNickname) {
      this.appLoggerService.logUser(
        'user_not_created_existing_nickname',
        undefined,
        email,
        false,
      );
      throw new ConflictException('this nickname has already been used');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 필요 시

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });

    // const user = this.userRepo.create(dto);
    const saved = await this.userRepo.save(user);
    this.appLoggerService.logUser('user_created', user.id, email, true);
    return UserDetailResponseDto.fromEntity(saved, 0, 0);
  }

  // 유저 수정
  async updateUser(
    id: number,
    dto: UpdateUserDto,
  ): Promise<UserDetailResponseDto> {
    const { email, nickname } = dto;
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== id) {
        this.appLoggerService.logUser(
          'user_not_updated_attempt_to_change_existing_email',
          existingEmail.id,
          email,
          false,
        );
        throw new ConflictException('this email has already been used'); // 409 에러를 던져줌
      }
    }

    if (dto.nickname) {
      const existingNickname = await this.userRepo.findOne({
        where: { nickname },
      });
      if (existingNickname && existingNickname.id !== id) {
        this.appLoggerService.logUser(
          'user_not_updated_attempt_to_change_existing_nickname',
          existingNickname.id,
          email,
          false,
        );
        throw new ConflictException('this nickname has already been used');
      }
    }

    const result = await this.userRepo.update(id, dto);

    if (result.affected === 0) {
      this.appLoggerService.logUser(
        'user_not_found_for_update',
        undefined,
        dto.email,
        false,
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.userRepo.findOne({ where: { id } });
    // {
    //   affected?: number;     // 영향받은 행 수 (수정된 행의 개수)
    //   generatedMaps: any[];  // 생성된 값들
    //   raw: any;             // 원시 결과
    // }

    if (!updated) {
      this.appLoggerService.logUser(
        'user_not_found_after_update',
        id,
        dto.email,
        false,
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 성공
    this.appLoggerService.logUser('user_updated', id, dto.email, true);

    // 연결된 관계가 혹여 없다고 해도 에러가 나지 않고 0이 나옴.
    const [postsCount, commentsCount] = await Promise.all([
      this.postRepo.count({
        where: { author: { id: updated.id } },
      }),
      this.commentRepo.count({
        where: { author: { id: updated.id } },
      }),
    ]);

    return UserDetailResponseDto.fromEntity(updated, postsCount, commentsCount);
  }

  // 유저 삭제
  async removeUser(id: number): Promise<void | boolean> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      this.appLoggerService.logUser(
        'user_not_found_for_removal',
        id, // ← id라도 남기기
        undefined,
        false,
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const tempEmail = user.email;
    await this.userRepo.remove(user); // 따로 응답을 내려주지 않음 (204)
    this.appLoggerService.logUser('user_removed', id, tempEmail, true);
  }

  // 리프레시 토큰 저장
  async saveRefreshToken(id: number, refreshToken: string) {
    const result = await this.userRepo.update(id, { refreshToken });

    if (result.affected === 0) {
      throw new NotFoundException('User Not Found');
    }

    console.log('refreshToken saved');
  }

  async validateRefreshToken(id: number, refreshToken: string) {
    console.log(id, refreshToken, '🏖️ !!!');
    if (typeof id !== 'number' || !refreshToken) {
      return false;
    }

    try {
      // 1. DB에서 해당 사용자의 최신 refresh 토큰 조회
      const user = await this.userRepo.findOne({
        where: { id },
        order: { createdAt: 'DESC' }, // 가장 최근에 발급된 토큰을 가져옴
      });

      if (!user || !user.refreshToken) {
        console.log(user.refreshToken, 'user.refreshToken');
        console.log('🤹‍♀️ isValid: false ? 1');

        return false; // 토큰이 DB에 없음
      }

      // 토큰 비교
      const isTokenMatching = refreshToken === user.refreshToken;

      if (!isTokenMatching) {
        console.log('🤹‍♀️ isValid: false ? 2');
        return false;
      }

      // 토큰 만료 여부 확인 (토큰 자체에서 만료 시간 파싱)
      try {
        // JWT 토큰에서 페이로드 디코딩
        const payload = this.decodeToken(refreshToken);

        // 만료 시간 확인
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // 토큰이 만료됨 - 삭제하고 false 반환
          console.log('🤹‍♀️ isValid: false ? 3');
          await this.removeRefreshToken(id);
          return false;
        }

        // userId 일치 확인 (추가 보안)
        if (payload.sub !== id.toString()) {
          console.log('🤹‍♀️ isValid: false ? 4');
          return false;
        }

        return true;
      } catch (decodeError) {
        console.log('🤹‍♀️ isValid: false ? 5');
        console.error('Error decoding refresh token:', decodeError);
        return false;
      }
    } catch (error) {
      console.log('🤹‍♀️ isValid: false ? 6');
      console.error(`Refresh token validation error for user ${id}:`, error);
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      // JWT는 header.payload.signature 형식
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Base64Url을 Base64로 변환 (패딩 추가)
      const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64Payload = base64Payload.padEnd(
        base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
        '=',
      );

      // Base64 디코딩 후 JSON 파싱
      const jsonPayload = Buffer.from(paddedBase64Payload, 'base64').toString();
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Failed to decode JWT: ' + error.message);
    }
  }

  // 리프레시 토큰 제거
  async removeRefreshToken(id: number) {
    // userId가 없거나 유효하지 않은 경우 조기 반환
    if (!id) {
      console.warn(
        'Cannot remove refresh token: User ID is missing or invalid',
      );
      return;
    }

    try {
      await this.userRepo.update({ id }, { refreshToken: null });
    } catch (error) {
      console.error(`Error removing refresh token for user ${id}:`, error);
    }
  }
}
