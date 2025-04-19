import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 여기가 핵심
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 값은 제거
      forbidNonWhitelisted: true, // DTO에 없는 값 들어오면 에러
      transform: true, // 타입 자동 변환 (ex: string → number)
    }),
  );

  // ✅ Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('BUMANG BLOG API')
    .setDescription('버망 블로그 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth() // ✅ BearerToken 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors();
  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
