import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';

export class DeletePostResponseDto {
  @ApiProperty()
  id: number;

  static fromEntity(post: PostEntity): DeletePostResponseDto {
    const dto = new DeletePostResponseDto();
    dto.id = post.id;
    return dto;
  }
}
