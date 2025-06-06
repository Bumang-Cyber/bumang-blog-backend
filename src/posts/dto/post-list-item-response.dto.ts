import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';
import { RolesEnum } from 'src/users/const/roles.const';

export class PostListItemResponseDto {
  @ApiProperty({ example: 0 })
  id: number;

  @ApiProperty({ example: '제목: 프로젝트 후기' })
  title: string;

  @ApiProperty()
  previewText: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ example: 'React' })
  categoryLabel: string;

  @ApiProperty({ example: 'Frontend' })
  groupLabel: string;

  @ApiProperty({ example: ['React', 'Next.js'] })
  tags: { title: string; id: number }[];

  @ApiProperty({ example: 'Bumang' })
  author: string;

  @ApiProperty({
    example: 'user',
    enum: RolesEnum,
    nullable: true,
  })
  readPermisson: RolesEnum;

  @ApiProperty({ required: false, example: '0' })
  score?: number;

  @ApiProperty()
  thumbnailUrl: string;

  static fromEntity(
    post: PostEntity & { score?: number },
  ): PostListItemResponseDto {
    const dto = new PostListItemResponseDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.previewText = post.previewText;
    dto.createdAt = post.createdAt;
    dto.categoryLabel = post.category?.label ?? null;
    dto.groupLabel = post.category?.group?.label ?? null;
    dto.tags =
      post.tags?.map((tag) => ({ title: tag.title, id: tag.id })) ?? [];
    dto.author = post.author?.nickname ?? 'unknown';
    dto.readPermisson = post.readPermission;
    dto.thumbnailUrl = post.thumbnailUrl;

    return dto;
  }
}
