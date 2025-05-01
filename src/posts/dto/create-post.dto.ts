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
  @IsString()
  title: string;

  @IsArray()
  @IsObject({ each: true }) // 배열 안의 각 요소가 객체인지 확인
  content: any[];

  @IsNumber()
  authorId: number;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];

  @IsOptional()
  @IsEnum(RolesEnum)
  readPermission: RolesEnum | null;
}
