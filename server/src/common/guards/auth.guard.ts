import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('JwtAuthGuard');
  }

  canActivate(context) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || 'no-id';

    if (err || !user) {
      const message = info?.message || 'Invalid or expired token';
      this.logger.warn(`[${requestId}] Authentication failed: ${message}`);
      throw err || new UnauthorizedException(message);
    }
    // Optionally attach request ID to user for logging
    user.requestId = requestId;
    return user;
  }
}