import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;
}
