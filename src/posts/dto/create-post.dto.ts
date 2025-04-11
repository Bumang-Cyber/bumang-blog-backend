import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

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
}
