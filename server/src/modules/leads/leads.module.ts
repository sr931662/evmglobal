import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadSchema } from './schemas/lead.schema';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Lead', schema: LeadSchema }]),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    UploadModule,
    EmailModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
