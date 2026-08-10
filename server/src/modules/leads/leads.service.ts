import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LeadsService {
  private logger = new Logger('LeadsService');

  constructor(@InjectModel('Lead') private leadModel: Model<any>) {}

  async createLead(data: any) {
    const lead = await new this.leadModel(data).save();
    this.logger.log(`New lead created with ID: ${lead._id}`);
    return lead.toJSON();
  }

  async findAll({ page = 1, limit = 10, status, search, type }: { page?: number; limit?: number; status?: string; search?: string; type?: string } = {}) {
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { phone:   { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.leadModel.countDocuments(filter);
    const leads = await this.leadModel
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.leadModel.findById(id).lean().exec();
  }

  async updateLead(id: string, data: Record<string, any>) {
    const lead = await this.leadModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!lead) {
      this.logger.warn(`Attempt to update non-existent lead ID: ${id}`);
      return null;
    }
    this.logger.log(`Lead ${id} updated`);
    return lead;
  }

  async deleteLead(id: string) {
    const lead = await this.leadModel.findByIdAndDelete(id).lean().exec();
    if (!lead) {
      this.logger.warn(`Attempt to delete non-existent lead ID: ${id}`);
      return null;
    }
    this.logger.log(`Lead ${id} deleted`);
    return { success: true };
  }

  async updateStatus(id: string, status: string) {
    const lead = await this.leadModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean()
      .exec();
    if (!lead) {
      this.logger.warn(`Attempt to update non-existent lead ID: ${id}`);
      return null;
    }
    this.logger.log(`Lead ${id} status updated to ${status}`);
    return lead;
  }

  async getFilteredLeads(filters: { status?: string; startDate?: string; endDate?: string } = {}) {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.startDate || filters.endDate) {
      filter.created_at = {};
      if (filters.startDate) filter.created_at.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.created_at.$lte = new Date(filters.endDate);
    }
    return this.leadModel.find(filter).sort({ created_at: -1 }).lean().exec();
  }
}
