import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('ExceptionFilter');

  constructor() {}

  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = request.headers['x-request-id'] || this.generateRequestId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || message;
      errorResponse = typeof exceptionResponse === 'object' ? exceptionResponse : {};
    } else {
      // Non-HttpException (unexpected error) – log full details but return safe message.
      this.logger.error(
        `[${requestId}] Unhandled exception: ${exception.message}`,
        exception.stack
      );
    }

    const errorPayload = {
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Internal Server Error',
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && { details: errorResponse }),
    };

    // Log HttpExceptions as well (but with lower severity)
    if (status >= 500) {
      this.logger.error(`[${requestId}] ${status} ${request.method} ${request.url} - ${message}`);
    } else {
      this.logger.warn(`[${requestId}] ${status} ${request.method} ${request.url} - ${message}`);
    }

    response.status(status).json(errorPayload);
  }

  generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
}