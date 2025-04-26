import { IsString } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  mimetype: string;
}
