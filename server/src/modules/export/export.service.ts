import { Injectable, Logger } from '@nestjs/common';
import { Transform } from 'json2csv';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class ExportService {
  private logger = new Logger('ExportService');

  constructor(private leadsService: LeadsService) {}

  async streamCsv(res: any, filters: { status?: string; startDate?: string; endDate?: string } = {}) {
    const leads = await this.leadsService.getFilteredLeads(filters);

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Phone', value: 'phone' },
      { label: 'Email', value: 'email' },
      { label: 'Message', value: 'message' },
      { label: 'File URL', value: 'file_url' },
      { label: 'Status', value: 'status' },
      { label: 'Created At', value: 'created_at' },
    ];

    const transform = new Transform({ fields, withBOM: true });
    transform.pipe(res);

    try {
      for (const lead of leads) {
        transform.write(lead);
      }
    } catch (error) {
      this.logger.error(`Error streaming CSV: ${error.message}`);
      throw error;
    } finally {
      transform.end();
    }
  }
}
