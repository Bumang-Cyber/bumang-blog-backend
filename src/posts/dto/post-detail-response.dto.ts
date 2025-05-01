import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';
import { RolesEnum } from 'src/users/const/roles.const';

export class CategorySimplifiedResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;
}

export class GroupSimplifiedResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;
}

export class TagSimplifiedResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;
}

export class PostDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: Record<string, any>;

  @ApiProperty()
  previewText: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  authorNickname: string;

  @ApiProperty({ enum: RolesEnum, nullable: true })
  readPermission: RolesEnum | null;

  @ApiProperty()
  view: number;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  isLiked: boolean; // ← 선택적으로 포함

  @ApiProperty({
    type: () => CategorySimplifiedResponse,
  })
  category: {
    id: number;

    label: string;
  };

  @ApiProperty({
    type: () => GroupSimplifiedResponse,
  })
  group: {
    id: number;

    label: string;
  };

  @ApiProperty({
    type: () => [GroupSimplifiedResponse],
  })
  tags: { id: number; label: string }[];

  static fromEntity(post: PostEntity): PostDetailResponseDto {
    const dto = new PostDetailResponseDto();
    dto.id = post.id;

    return dto;
  }
}
