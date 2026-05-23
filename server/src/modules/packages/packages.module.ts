import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackageSchema } from './schemas/package.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Package', schema: PackageSchema }])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
