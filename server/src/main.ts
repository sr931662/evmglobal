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
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();