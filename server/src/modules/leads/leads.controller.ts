import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { createLeadSchema } from './dto/create-lead.dto';
import { updateLeadStatusSchema } from './dto/update-lead-status.dto';

@Controller('leads')
export class LeadsController {
  private logger = new Logger('LeadsController');

  constructor(
    private leadsService: LeadsService,
    private uploadService: UploadService,
    private emailService: EmailService,
  ) {}

  /**
   * POST /api/leads
   * Public endpoint – anyone can submit a lead.
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() body, @UploadedFile() file) {
    // Validate body fields
    const { error, value: sanitizedData } = createLeadSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    const leadData = sanitizedData;

    // Handle file upload
    if (file) {
      try {
        const uploadResult = await this.uploadService.uploadFile(file) as any;
        leadData.fileUrl = uploadResult.secure_url;
      } catch (err) {
        this.logger.error(`File upload failed: ${err.message}`);
        throw new InternalServerErrorException('File upload failed');
      }
    }

    // Create lead
    const lead = await this.leadsService.createLead(leadData);

    // Send email notification (do not fail request if email fails)
    try {
      await this.emailService.sendLeadNotification(lead);
    } catch (emailError) {
      this.logger.error(`Email notification failed for lead ${lead.id}: ${emailError.message}`);
    }

    return {
      success: true,
      data: lead,
    };
  }

  /**
   * GET /api/leads
   * Admin only – list leads with pagination & filtering.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query() query) {
    const page   = Math.max(parseInt(query.page,  10) || 1,  1);
    const limit  = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const status = query.status || undefined;
    const search = query.search || undefined;
    const type   = query.type   || undefined;
    return this.leadsService.findAll({ page, limit, status, search, type });
  }

  /**
   * GET /api/leads/:id
   * Admin only – single lead details.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const lead = await this.leadsService.findById(id);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /**
   * PUT /api/leads/:id
   * Admin only – update lead fields (name, phone, email, message, status).
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateLead(@Param('id') id: string, @Body() body: any) {
    const allowed = ['name', 'phone', 'email', 'message', 'status', 'destination', 'travelDate', 'travellers'];
    const data: any = {};
    allowed.forEach(k => { if (body[k] !== undefined) data[k] = body[k]; });
    const lead = await this.leadsService.updateLead(id, data);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /**
   * PUT /api/leads/:id/status
   * Admin only – update lead status only (kept for backwards compat).
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    const { error, value } = updateLeadStatusSchema.validate(body, { stripUnknown: true });
    if (error) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
      });
    }
    const lead = await this.leadsService.updateStatus(id, value.status);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /**
   * DELETE /api/leads/:id
   * Admin only – delete a lead.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteLead(@Param('id') id: string) {
    const result = await this.leadsService.deleteLead(id);
    if (!result) throw new NotFoundException('Lead not found');
    return result;
  }
}