import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

@Injectable()
export class PackagesService implements OnModuleInit {
  private logger = new Logger('PackagesService');

  constructor(@InjectModel('Package') private packageModel: Model<any>) {}

  async onModuleInit() {
    const unsluggedPackages = await this.packageModel.find({ slug: { $exists: false } }).lean().exec();
    for (const pkg of unsluggedPackages) {
      const base = slugify((pkg as any).title || 'package');
      let slug = base;
      let suffix = 1;
      while (await this.packageModel.exists({ slug, _id: { $ne: (pkg as any)._id } })) {
        slug = `${base}-${suffix++}`;
      }
      await this.packageModel.updateOne({ _id: (pkg as any)._id }, { slug });
    }
    if (unsluggedPackages.length > 0) {
      this.logger.log(`Backfilled slugs for ${unsluggedPackages.length} packages`);
    }
  }

  private normalize(doc: any) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id.toString() };
  }

  async findAll(query: { search?: string; category?: string; status?: string; destination?: string } = {}) {
    const filter: any = {};
    if (query.category)    filter.category = query.category;
    if (query.status)      filter.status   = query.status;
    if (query.destination) {
      filter.$and = [...(filter.$and || []), { $or: [
        { destinations: { $regex: query.destination, $options: 'i' } },
        { title:        { $regex: query.destination, $options: 'i' } },
      ]}];
    }
    if (query.search) {
      filter.$and = [...(filter.$and || []), { $or: [
        { title:        { $regex: query.search, $options: 'i' } },
        { category:     { $regex: query.search, $options: 'i' } },
        { destinations: { $regex: query.search, $options: 'i' } },
      ]}];
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

  async findById(idOrSlug: string) {
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const pkg = isObjectId
      ? await this.packageModel.findById(idOrSlug).lean().exec()
      : await this.packageModel.findOne({ slug: idOrSlug }).lean().exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return this.normalize(pkg);
  }

  async create(data: any) {
    const base = slugify(data.title || 'package');
    let slug = base;
    let suffix = 1;
    while (await this.packageModel.exists({ slug })) {
      slug = `${base}-${suffix++}`;
    }
    const pkg = await new this.packageModel({ ...data, slug }).save();
    this.logger.log(`Package created: ${pkg.title} [${slug}]`);
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
