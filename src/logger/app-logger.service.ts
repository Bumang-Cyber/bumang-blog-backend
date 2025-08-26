import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// src/logger/custom-logger.service.ts
@Injectable()
export class AppLoggerService {
  constructor(
    // app.module.ts에서 winstonConfig대로 등록했던 logger를 불러온다.
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // 비즈니스 로직 로깅만 남기기
  logPost(action: string, postId?: number, userId?: number, title?: string) {
    this.logger.info(`Post ${action}`, {
      action,
      postId,
      userId,
      title,
      category: 'blog_post',
    });
  }

  logAuth(
    action: string,
    userId?: number,
    email?: string,
    success: boolean = true,
  ) {
    const level = success ? 'info' : 'warn';
    this.logger[level](`Auth ${action}`, {
      action,
      userId,
      email,
      success,
      category: 'auth',
    });
  }
}
