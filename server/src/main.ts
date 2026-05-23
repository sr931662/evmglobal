import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new RequestIdMiddleware().use);

  app.setGlobalPrefix('api');

  // Support comma-separated list of allowed origins so both the Cloudflare
  // Pages URL and any custom domain work without code changes.
  // e.g. FRONTEND_URL=https://evmglobal.pages.dev,https://www.evmglobal.com
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  // Cloud Run requires listening on 0.0.0.0 and reads PORT from env (default 8080)
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Server running on port ${port}`, 'Bootstrap');
}
bootstrap().catch(err => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
