import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdsService {
  constructor(@InjectModel('Ad') private adModel: Model<any>) {}

  async findAll(query: { placement?: string; status?: string } = {}) {
    const filter: any = {};
    if (query.placement) filter.placement = query.placement;
    if (query.status)    filter.status    = query.status;
    return this.adModel.find(filter).sort({ priority: -1, created_at: -1 }).lean().exec();
  }

  // Active creatives for a placement, in-schedule, highest priority first —
  // what the public site actually renders.
  async findActiveByPlacement(placement: string) {
    const now = new Date();
    return this.adModel
      .find({
        placement,
        status: 'Active',
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ],
      })
      .sort({ priority: -1, created_at: -1 })
      .lean()
      .exec();
  }

  async create(data: any) {
    const ad = await new this.adModel(data).save();
    return ad.toJSON();
  }

  async update(id: string, data: any) {
    const ad = await this.adModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async remove(id: string) {
    const ad = await this.adModel.findByIdAndDelete(id).lean().exec();
    if (!ad) throw new NotFoundException('Ad not found');
    return { success: true };
  }
}
