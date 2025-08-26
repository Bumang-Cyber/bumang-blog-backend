import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 값은 제거
      forbidNonWhitelisted: true, // DTO에 없는 값 들어오면 에러
      transform: true, // 타입 자동 변환 (ex: string → number)
    }),
  );

  // Winston 로거를 기본 로거로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 로깅 인터셉터 적용
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(WINSTON_MODULE_PROVIDER)),
  );

  app.use((req, res, next) => {
    console.log('🔥 요청 수신됨:', req.method, req.url);
    console.log('🔥 req.cookies: ', req.cookies);
    // console.log('🔥 req.headers.cookie: ', req.headers.cookie);
    next();
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('BUMANG BLOG API')
    .setDescription('버망 블로그 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth() // ✅ BearerToken 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: [
      'http://localhost:4000',
      'https://bumang.xyz',
      'https://www.bumang.xyz',
    ],
    credentials: true,
  });
  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
