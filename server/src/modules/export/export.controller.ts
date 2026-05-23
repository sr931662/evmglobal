import {
  Controller,
  Get,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('export')
export class ExportController {
  private logger = new Logger('ExportController');

  constructor(private exportService: ExportService) {}

  /**
   * GET /api/export/leads
   * Exports all leads (or filtered) as a CSV file.
   * Query params:
   *  - status (optional): filter by lead status
   *  - startDate (optional): ISO date string, start of range
   *  - endDate (optional): ISO date string, end of range
   */
  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async exportLeads(
    @Res() res,
    @Query('status') status,
    @Query('startDate') startDate,
    @Query('endDate') endDate,
  ) {
    const requestId = res.req.headers['x-request-id'] || 'no-id';
    this.logger.log(`[${requestId}] CSV export requested with filters: status=${status}, startDate=${startDate}, endDate=${endDate}`);

    try {
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="leads-export-${Date.now()}.csv"`,
      );
      // Prevent caching
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');

      // Stream CSV data to response
      await this.exportService.streamCsv(res, { status, startDate, endDate });
      this.logger.log(`[${requestId}] CSV export completed successfully`);
    } catch (error) {
      this.logger.error(`[${requestId}] CSV export failed: ${error.message}`);
      // If headers haven't been sent, return JSON error
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Failed to export leads',
        });
      }
    }
  }
}