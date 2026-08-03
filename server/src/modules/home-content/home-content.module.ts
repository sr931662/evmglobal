import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeContentSchema } from './schemas/home-content.schema';
import { HomeContentService } from './home-content.service';
import { HomeContentController } from './home-content.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'HomeContent', schema: HomeContentSchema }])],
  controllers: [HomeContentController],
  providers: [HomeContentService],
})
export class HomeContentModule {}
