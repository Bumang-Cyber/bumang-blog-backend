import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class CreatePostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  title: string;

  static fromEntity(post: PostEntity): CreatePostResponseDto {
    const dto = new CreatePostResponseDto();
    dto.id = post.id;
    dto.categoryId = post.category?.id ?? null;
    dto.title = post.title;

    return dto;
  }
}
