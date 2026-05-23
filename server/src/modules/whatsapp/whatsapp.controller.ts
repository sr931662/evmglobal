import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private whatsappService: WhatsAppService) {}

  /**
   * GET /api/whatsapp/link?phone=1234567890&message=Hi
   * Admin only – returns a WhatsApp deep‑link.
   */
  @Get('link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generateLink(@Query('phone') phone, @Query('message') message) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    const link = this.whatsappService.generateDeepLink(phone, message || '');
    return { link };
  }
}