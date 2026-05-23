import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  // ── Public endpoint — no auth required ──────────────────────────────────────
  @Get('lookup')
  lookupByRef(@Query('ref') ref: string, @Query('phone') phone?: string) {
    return this.quotesService.findByRef(ref, phone);
  }

  // ── Admin-only endpoints ─────────────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() query: any) {
    return this.quotesService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStats() {
    return this.quotesService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.quotesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.quotesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}
