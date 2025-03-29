import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // 전체 유저 조회
  async findAllUser(): Promise<UserEntity[]> {
    return this.userRepo.find({
      relations: ['posts', 'comments'], // 옵션
    });
  }

  // 특정 유저 조회
  async findOneUser(id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`해당 ID의 유저가 존재하지 않습니다.`); // 404 에러를 던져줌
    }

    return user;
  }

  // 유저 생성
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const { email, nickname } = dto;

    const existingEmail = await this.userRepo.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('this email has already been used'); // 409 에러를 던져줌
    }

    const existingNickname = await this.userRepo.findOne({
      where: { nickname },
    });
    if (existingNickname) {
      throw new ConflictException('this nickname has already been used');
    }

    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  // 유저 수정
  async updateUser(
    id: number,
    dto: UpdateUserResponseDto,
  ): Promise<UserEntity> {
    await this.userRepo.update(id, dto);
    return this.userRepo.findOne({
      where: { id },
    });
  }

  // 유저 삭제
  async removeUser(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }
}
