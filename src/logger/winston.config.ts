import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const isDev = process.env.NODE_ENV !== 'production';

// 로그 디렉토리 생성
import * as fs from 'fs';
const logDir = 'logs';

// logDir가 없으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 커스텀 포맷
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// 개발용 콘솔 포맷
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('BlogAPI', {
    colors: true,
    prettyPrint: true,
  }),
);

export const winstonConfig = {
  level: isDev ? 'debug' : 'info',
  format: customFormat,
  defaultMeta: {
    service: 'blog-api',
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    // 개발환경: 콘솔 출력
    ...(isDev
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : []),

    // 전체 로그
    new winston.transports.File({
      filename: `${logDir}/app.log`,
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5,
    }),

    // 에러 로그 분리
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 3,
    }),
  ],

  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: `${logDir}/exceptions.log`,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 2,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: `${logDir}/rejections.log`,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 2,
    }),
  ],
};
