// src/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';

@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService], // 다른 모듈에서 사용할 수 있도록 export
})
export class AppLoggerModule {}
