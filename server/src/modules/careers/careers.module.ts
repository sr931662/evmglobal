import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerSchema } from './schemas/career.schema';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Career', schema: CareerSchema }])],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
