import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { HomeContentService } from './home-content.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('home-content')
export class HomeContentController {
  constructor(private homeContentService: HomeContentService) {}

  // ── Public reads ───────────────────────────────────────────────────────────
  @Get()
  findAll(@Query() query: any) {
    return this.homeContentService.findAll(query);
  }

  @Get('grouped')
  findGrouped() {
    return this.homeContentService.findGrouped();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeContentService.findOne(id);
  }

  // ── Admin writes ───────────────────────────────────────────────────────────
  @Put('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reorder(@Body() body: { items: { id: string; order: number }[] }) {
    return this.homeContentService.reorder(body?.items);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.homeContentService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.homeContentService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.homeContentService.remove(id);
  }
}
