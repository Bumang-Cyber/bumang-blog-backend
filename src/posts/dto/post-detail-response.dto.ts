import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class PostDetailResponseDto {
  @ApiProperty()
  id: number;

  static fromEntity(post: PostEntity): PostDetailResponseDto {
    const dto = new PostDetailResponseDto();
    dto.id = post.id;
    return dto;
  }
}
