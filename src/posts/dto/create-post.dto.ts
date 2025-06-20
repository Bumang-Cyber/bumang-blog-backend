import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RolesEnum } from 'src/users/const/roles.const';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  previewText: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  thumbnailUrl: string;

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
