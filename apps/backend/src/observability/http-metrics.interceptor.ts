import {
  Injectable,
  NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap({
        next: () => {
          this.metricsService.recordHttpRequest(
            request.method,
            this.resolvePath(request),
            response.statusCode,
          );
        },
        error: () => {
          this.metricsService.recordHttpRequest(
            request.method,
            this.resolvePath(request),
            response.statusCode || 500,
          );
        },
      }),
    );
  }

  private resolvePath(request: Request): string {
    const routePath = this.extractRoutePath(request);
    if (!routePath) {
      return request.path || 'unknown';
    }

    const base = request.baseUrl || '';
    return `${base}${routePath}`;
  }

  private extractRoutePath(request: Request): string | undefined {
    const route = request.route as { path?: string } | undefined;
    return route?.path;
  }
}
