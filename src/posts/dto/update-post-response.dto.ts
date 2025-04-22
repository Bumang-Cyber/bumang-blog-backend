import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class UpdatePostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  title: string;

  static fromEntity(post: PostEntity): UpdatePostResponseDto {
    const dto = new UpdatePostResponseDto();
    dto.id = post.id;
    dto.categoryId = post.category?.id ?? null;
    dto.title = post.title;

    return dto;
  }
}
