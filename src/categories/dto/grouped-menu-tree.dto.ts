import { ApiProperty } from '@nestjs/swagger';
import { GroupEntity } from '../entities/group.entity';
import { CategoryEntity } from '../entities/category.entity';

class CategoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  order: number;

  static fromEntity(category: CategoryEntity): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.label = category.label;
    dto.order = category.order;
    return dto;
  }
}

export class GroupedMenuTreeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  categories: CategoryResponseDto[];

  static fromEntity(group: GroupEntity): GroupedMenuTreeResponseDto {
    const dto = new GroupedMenuTreeResponseDto();
    dto.id = group.id;
    dto.label = group.label;
    dto.categories =
      group.categories
        ?.slice()
        .sort((a, b) => a.order - b.order)
        .map(CategoryResponseDto.fromEntity) ?? [];

    return dto;
  }
}
