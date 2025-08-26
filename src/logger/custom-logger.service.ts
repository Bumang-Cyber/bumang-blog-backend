import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // 블로그 특화 로깅 메서드들
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    ip?: string,
  ) {
    const logData = {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      category: 'request',
    };

    if (statusCode >= 400) {
      this.logger.warn('Request failed', logData);
    } else {
      this.logger.info('Request completed', logData);
    }
  }

  logPost(action: string, postId?: number, userId?: number, title?: string) {
    this.logger.info(`Post ${action}`, {
      action,
      postId,
      userId,
      title,
      category: 'blog_post',
    });
  }

  logComment(
    action: string,
    commentId?: number,
    postId?: number,
    userId?: number,
  ) {
    this.logger.info(`Comment ${action}`, {
      action,
      commentId,
      postId,
      userId,
      category: 'comment',
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
