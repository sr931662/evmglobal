import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // or use a simple generator

@Injectable()
export class RequestIdMiddleware {
  use(req, res, next) {
    // Preserve existing request ID if present (e.g., from proxy)
    req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
  }
}