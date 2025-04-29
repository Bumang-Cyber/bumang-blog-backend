import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';
import { RolesEnum } from '../const/roles.const';

export class UserDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: RolesEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  postsCount: number;

  @ApiProperty()
  commentsCount: number;

  static fromEntity(
    user: UserEntity,
    postsCount: number,
    commentsCount: number,
  ): UserDetailResponseDto {
    const dto = new UserDetailResponseDto();

    dto.id = user.id;
    dto.nickname = user.nickname;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.role = user.role;
    dto.postsCount = postsCount;
    dto.commentsCount = commentsCount;

    return dto;
  }
}
