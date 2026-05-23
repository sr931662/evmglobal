import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { JoiValidationPipe } from './pipes/validation.pipe'; // Global pipe if needed

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Optional global validation pipe (use only if all DTOs follow the same pattern)
    // {
    //   provide: APP_PIPE,
    //   useClass: JoiValidationPipe,
    // },
  ],
  exports: [],
})
export class CommonModule {}