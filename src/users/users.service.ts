import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // 전체 유저 조회
  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find({
      relations: ['posts', 'comments'], // 옵션
    });
  }

  // 특정 유저 조회
  async findOne(id: number): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });
  }

  // 유저 생성
  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  // 유저 수정
  async update(id: number, dto: UpdateUserResponseDto): Promise<UserEntity> {
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  // 유저 삭제
  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }
}
