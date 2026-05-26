import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private customerModel: Model<any>) {}

  private normalize(doc: any) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id.toString() };
  }

  async upsert(data: { name: string; email: string; phone?: string; city?: string }) {
    const doc = await this.customerModel.findOneAndUpdate(
      { email: data.email.toLowerCase().trim() },
      {
        $set: {
          name:     data.name.trim(),
          phone:    data.phone?.trim() || '',
          city:     data.city?.trim()  || '',
          lastSeen: new Date(),
        },
        $setOnInsert: { email: data.email.toLowerCase().trim() },
      },
      { upsert: true, new: true }
    ).lean().exec();
    return this.normalize(doc);
  }

  async findAll(query: { search?: string } = {}) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name:  { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { city:  { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }
    const docs = await this.customerModel.find(filter).sort({ created_at: -1 }).lean().exec();
    return docs.map(d => this.normalize(d));
  }

  async getStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, newThisMonth] = await Promise.all([
      this.customerModel.countDocuments(),
      this.customerModel.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
    ]);

    return { total, newThisMonth };
  }
}
