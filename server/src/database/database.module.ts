import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI environment variable is not set');
        return {
          uri,
          serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
          connectTimeoutMS:         10000,
          socketTimeoutMS:          45000,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
