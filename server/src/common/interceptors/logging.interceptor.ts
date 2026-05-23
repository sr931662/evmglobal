import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // optional, or generate manually

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  constructor() {}

  intercept(context, next) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const startTime = Date.now();

    // Ensure request ID
    let requestId = request.headers['x-request-id'];
    if (!requestId) {
      requestId = uuidv4 ? uuidv4() : `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      request.headers['x-request-id'] = requestId;
    }

    // Extract user identifier if authenticated
    const user = request.user;
    const userId = user?.id || 'anonymous';

    this.logger.log(`[${requestId}] Incoming ${method} ${url} - User: ${userId}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} - ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error.status || 500} - ${duration}ms - Error: ${error.message}`
          );
        },
      }),
    );
  }
}