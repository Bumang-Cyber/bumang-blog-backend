import { ApiProperty } from '@nestjs/swagger';
import { TagsEntity } from '../entities/tag.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class CommonTagResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  group: {
    id: number;
    label: string;
  };

  static fromEntity(tag: TagsEntity): CommonTagResponseDto {
    if (!tag.group) {
      throw new InternalServerErrorException('Tag must have a group');
    }

    const dto = new CommonTagResponseDto();
    dto.id = tag.id;
    dto.title = tag.title;
    dto.group = {
      id: tag.group.id,
      label: tag.group.label,
    };

    return dto;
  }
}
