import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PackagesService {
  private logger = new Logger('PackagesService');

  constructor(@InjectModel('Package') private packageModel: Model<any>) {}

  private normalize(doc: any) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id.toString() };
  }

  async findAll(query: { search?: string; category?: string; status?: string; destination?: string } = {}) {
    const filter: any = {};
    if (query.category)    filter.category = query.category;
    if (query.status)      filter.status   = query.status;
    if (query.destination) filter.destinations = { $regex: query.destination, $options: 'i' };
    if (query.search) {
      filter.$or = [
        { title:        { $regex: query.search, $options: 'i' } },
        { category:     { $regex: query.search, $options: 'i' } },
        { destinations: { $regex: query.search, $options: 'i' } },
      ];
    }
    const docs = await this.packageModel.find(filter).sort({ created_at: -1 }).lean().exec();
    return docs.map(d => this.normalize(d));
  }

  async getStats() {
    const [total, active, agg, bestSeller] = await Promise.all([
      this.packageModel.countDocuments(),
      this.packageModel.countDocuments({ status: 'Active' }),
      this.packageModel.aggregate([{ $group: { _id: null, total: { $sum: '$bookings' } } }]),
      this.packageModel.findOne().sort({ bookings: -1 }).select('title').lean().exec(),
    ]);
    return {
      total,
      active,
      totalBookings: agg[0]?.total || 0,
      bestSeller: (bestSeller as any)?.title || 'N/A',
    };
  }

  async findById(id: string) {
    const pkg = await this.packageModel.findById(id).lean().exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return this.normalize(pkg);
  }

  async create(data: any) {
    const pkg = await new this.packageModel(data).save();
    this.logger.log(`Package created: ${pkg.title}`);
    return this.normalize(pkg.toObject());
  }

  async update(id: string, data: any) {
    const pkg = await this.packageModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return this.normalize(pkg);
  }

  async remove(id: string) {
    const pkg = await this.packageModel.findByIdAndDelete(id).lean().exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return { success: true };
  }
}
