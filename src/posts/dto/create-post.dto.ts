import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  content: Record<string, any>;

  @IsNumber()
  authorId: number;

  @IsNumber()
  categoryId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];
}
