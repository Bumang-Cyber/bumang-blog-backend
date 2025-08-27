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
  // this.logger.error('에러 메시지', { data });    // 0 - 가장 높음
  // this.logger.warn('경고 메시지', { data });     // 1
  // this.logger.info('정보 메시지', { data });     // 2
  // this.logger.http('HTTP 메시지', { data });     // 3
  // this.logger.verbose('상세 메시지', { data });  // 4
  // this.logger.debug('디버그 메시지', { data });  // 5
  // this.logger.silly('모든 메시지', { data });    // 6 - 가장 낮음

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

  logUser(
    action: string,
    userId?: number,
    email?: string,
    success: boolean = true,
  ) {
    const level = success ? 'info' : 'warn';
    this.logger[level](`User ${action}`, {
      action,
      userId,
      email,
      success,
      category: 'user',
    });
  }
}
