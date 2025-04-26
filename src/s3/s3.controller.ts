import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { S3Service } from './s3.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';

@ApiBearerAuth() // SWAGGER: 토큰 입력 가능
@ApiTags('Category') // Swagger UI에서 그룹 이름
@Controller('categories')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.s3Service.generatePresignedUrl(dto.filename, dto.mimetype);
  }
}
