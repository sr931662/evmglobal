import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller'; // optional

@Module({
  providers: [WhatsAppService],
  controllers: [WhatsAppController], // remove if not needed
  exports: [WhatsAppService],
})
export class WhatsAppModule {}