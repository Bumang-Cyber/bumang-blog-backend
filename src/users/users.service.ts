import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  // 특정 유저 조회 (아이디로)
  async findOneUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with this ID does not exist`); // 404 에러를 던져줌
    }

    return user;
  }

  // 특정 유저 조회 (이메일로)
  async findOneUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with this Email does not exist`); // 404 에러를 던져줌
    }

    return user;
  }

  // 특정 유저 조회 (닉네임으로)
  async findOneUserByNickname(nickname: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { nickname },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with this Email does not exist`); // 404 에러를 던져줌
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
  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const { email, nickname } = dto;
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException('this email has already been used'); // 409 에러를 던져줌
      }
    }

    if (dto.nickname) {
      const existingNickname = await this.userRepo.findOne({
        where: { nickname },
      });
      if (existingNickname) {
        throw new ConflictException('this nickname has already been used');
      }
    }

    const result = await this.userRepo.update(id, dto);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.userRepo.findOne({ where: { id } });

    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updated;
  }

  // 유저 삭제
  async removeUser(id: number): Promise<void | boolean> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepo.remove(user); // 따로 응답을 내려주지 않음
  }

  // 리프레시 토큰 저장
  async saveRefreshToken(id: number, refreshToken: string) {
    const result = await this.userRepo.update(id, { refreshToken });

    if (result.affected === 0) {
      throw new NotFoundException('User Not Found');
    }

    // 뭘 리턴해줘야 되나??
  }

  // 리프레시 토큰 제거
  async removeRefreshToken(id: number) {
    const result = await this.userRepo.update(id, { refreshToken: null });

    if (result.affected === 0) {
      throw new NotFoundException('User Not Found');
    }

    // 뭘 리턴해줘야 되나??
  }
}
