import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private customerModel: Model<any>) {}

  private normalize(doc: any) {
    if (!doc) return doc;
    const { _id, __v, password, ...rest } = doc;
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

  async create(data: { name: string; email: string; phone?: string; city?: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const doc = await this.customerModel.create({
      name:     data.name.trim(),
      email:    data.email.toLowerCase().trim(),
      phone:    data.phone?.trim() || '',
      city:     data.city?.trim()  || '',
      password: hashed,
      lastSeen: new Date(),
    });
    return this.normalize(doc.toObject());
  }

  async findByEmail(email: string, withPassword = false) {
    const key = email.toLowerCase().trim();
    const query = this.customerModel.findOne({ email: key });
    if (withPassword) query.select('+password');
    const doc = await query.lean().exec();
    return doc || null;
  }

  async findById(id: string, withPassword = false) {
    const query = this.customerModel.findById(id);
    if (withPassword) query.select('+password');
    const doc = await query.lean().exec();
    return doc || null;
  }

  async updatePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.customerModel.findByIdAndUpdate(id, { password: hashed }).exec();
  }

  async updateProfile(id: string, data: { name?: string; phone?: string; city?: string }) {
    const update: any = { lastSeen: new Date() };
    if (data.name  !== undefined) update.name  = data.name.trim();
    if (data.phone !== undefined) update.phone = data.phone.trim();
    if (data.city  !== undefined) update.city  = data.city.trim();
    const doc = await this.customerModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean().exec();
    return this.normalize(doc);
  }

  async findAll(query: { search?: string; page?: number; limit?: number } = {}) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name:  { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { city:  { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page  = Math.max(Number(query.page)  || 1,  1);
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip  = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.customerModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean().exec(),
      this.customerModel.countDocuments(filter),
    ]);

    return {
      customers: docs.map(d => this.normalize(d)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
