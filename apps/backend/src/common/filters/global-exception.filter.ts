import * as Sentry from '@sentry/nestjs';
import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception, statusCode);

    if (statusCode >= 500) {
      Sentry.captureException(exception);
    } else {
      Sentry.addBreadcrumb({
        category: 'http',
        level: 'warning',
        message: `${request.method} ${request.url} -> ${statusCode}`,
      });
    }

    this.logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Request failed',
        method: request.method,
        path: request.url,
        statusCode,
        error: message,
      }),
    );

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveMessage(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null) {
        const possibleMessage = (response as { message?: string | string[] })
          .message;
        if (Array.isArray(possibleMessage)) {
          return possibleMessage.join(', ');
        }
        if (typeof possibleMessage === 'string') {
          return possibleMessage;
        }
      }

      return exception.message;
    }

    return statusCode >= 500 ? 'Internal server error' : 'Request failed';
  }
}
