import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { LeadsModule } from '../leads/leads.module'; // to access LeadsService

@Module({
  imports: [LeadsModule], // LeadsModule must export LeadsService
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}