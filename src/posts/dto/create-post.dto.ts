import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { RolesEnum } from 'src/users/const/roles.const';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ type: 'object', isArray: true, additionalProperties: true })
  @IsArray()
  @IsObject({ each: true }) // 배열 안의 각 요소가 객체인지 확인
  content: any[];

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];

  @ApiProperty({ enum: RolesEnum, required: false, nullable: true })
  @IsOptional()
  @IsEnum(RolesEnum)
  readPermission: RolesEnum | null;
}
