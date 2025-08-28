// src/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MetricsService } from 'src/metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly metricsService: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip } = request;

    const startTime = Date.now();

    this.logger.info(`[REQUEST] ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        const durationSeconds = duration / 1000;

        this.logger.info(
          `[RESPONSE] ${method} ${url} - ${statusCode} - ${duration}ms`,
        );

        // Prometheus 메트릭
        this.metricsService.incrementHttpRequests(method, url, statusCode);
        this.metricsService.observeHttpDuration(method, url, durationSeconds);
      }),
    );
  }
}
