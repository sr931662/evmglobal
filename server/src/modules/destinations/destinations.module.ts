import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DestinationSchema } from './schemas/destination.schema';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Destination', schema: DestinationSchema }])],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule {}
