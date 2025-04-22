import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class PostListItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
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
  tags: string[];

  @ApiProperty({ example: 'Bumang' })
  author: string;

  static fromEntity(post: PostEntity): PostListItemResponseDto {
    const dto = new PostListItemResponseDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.previewText = post.previewText;
    dto.createdAt = post.createdAt;
    dto.categoryLabel = post.category?.label ?? null;
    dto.groupLabel = post.category?.group?.label ?? null;
    dto.tags = post.tags?.map((tag) => tag.title) ?? [];
    dto.author = post.author?.nickname ?? 'unknown';
    return dto;
  }
}
