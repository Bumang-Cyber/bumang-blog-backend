// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly authAttempts: Counter<string>;
  private readonly postViews: Counter<string>;

  constructor() {
    // HTTP 요청 카운터
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // HTTP 응답 시간
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // 활성 연결 수
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    // 인증 시도
    this.authAttempts = new Counter({
      name: 'auth_attempts_total',
      help: 'Total authentication attempts',
      labelNames: ['type', 'status'],
    });

    // 포스트 조회 수
    this.postViews = new Counter({
      name: 'post_views_total',
      help: 'Total post views',
      labelNames: ['post_id'],
    });

    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.activeConnections);
    register.registerMetric(this.authAttempts);
    register.registerMetric(this.postViews);
  }

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  incrementAuthAttempts(type: 'login' | 'signup', success: boolean) {
    this.authAttempts.inc({ type, status: success ? 'success' : 'failure' });
  }

  incrementPostViews(postId: number) {
    this.postViews.inc({ post_id: postId.toString() });
  }

  getMetrics() {
    return register.metrics();
  }
}
