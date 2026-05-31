import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CareersService {
  constructor(@InjectModel('Career') private careerModel: Model<any>) {}

  async findAll(query: { status?: string; department?: string; page?: number; limit?: number } = {}) {
    const filter: any = {};
    if (query.status)     filter.status     = query.status;
    if (query.department) filter.department = query.department;

    const page  = Math.max(Number(query.page)  || 1,  1);
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip  = (page - 1) * limit;

    const [careers, total] = await Promise.all([
      this.careerModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean().exec(),
      this.careerModel.countDocuments(filter),
    ]);

    return { careers, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const job = await this.careerModel.findById(id).lean().exec();
    if (!job) throw new NotFoundException('Job posting not found');
    return job;
  }

  async create(data: any) {
    const job = await new this.careerModel(data).save();
    return job.toJSON();
  }

  async update(id: string, data: any) {
    const job = await this.careerModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!job) throw new NotFoundException('Job posting not found');
    return job;
  }

  async remove(id: string) {
    const job = await this.careerModel.findByIdAndDelete(id).lean().exec();
    if (!job) throw new NotFoundException('Job posting not found');
    return { success: true };
  }
}
