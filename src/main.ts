import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import './global';

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

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
