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
  content: string;

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
  views: number;

  @ApiProperty()
  likes: number;

  // @ApiProperty()
  // isLiked: boolean; // ← 선택적으로 포함

  @ApiProperty({
    type: () => CategorySimplifiedResponse,
    nullable: true,
  })
  category: CategorySimplifiedResponse;

  @ApiProperty({
    type: () => GroupSimplifiedResponse,
    nullable: true,
  })
  group: GroupSimplifiedResponse;

  @ApiProperty({
    type: () => [TagSimplifiedResponse],
  })
  tags: TagSimplifiedResponse[];

  @ApiProperty()
  thumbnailUrl: string;

  static fromEntity(post: PostEntity): PostDetailResponseDto {
    const dto = new PostDetailResponseDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.content = post.content;
    dto.previewText = post.previewText;

    dto.createdAt = post.createdAt;
    dto.updatedAt = post.updatedAt;

    dto.authorNickname = post.author?.nickname ?? 'unknown';
    dto.readPermission = post.readPermission;
    dto.thumbnailUrl = post.thumbnailUrl;

    dto.views = post.view;
    dto.likes = post.likes;

    dto.category = post.category
      ? {
          id: post.category.id,
          label: post.category.label,
        }
      : null;

    dto.group = post.category.group
      ? {
          id: post.category.group.id,
          label: post.category.group.label,
        }
      : null;

    dto.tags = [...post.tags.map((tag) => ({ id: tag.id, label: tag.title }))];

    return dto;
  }
}
