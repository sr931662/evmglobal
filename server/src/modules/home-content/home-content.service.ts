import { Injectable, OnModuleInit, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HOME_SECTIONS } from './schemas/home-content.schema';
import { HOME_CONTENT_SEED } from './home-content.seed';

@Injectable()
export class HomeContentService implements OnModuleInit {
  private logger = new Logger('HomeContentService');

  constructor(@InjectModel('HomeContent') private homeContentModel: Model<any>) {}

  /** Seed each section independently so a partially populated DB still fills in. */
  async onModuleInit() {
    for (const section of HOME_SECTIONS) {
      const count = await this.homeContentModel.countDocuments({ section });
      if (count > 0) continue;

      const items = (HOME_CONTENT_SEED as any)[section] || [];
      if (items.length === 0) continue;

      await this.homeContentModel.insertMany(
        items.map((item: any, i: number) => ({ ...item, section, order: i, status: 'active' }))
      );
      this.logger.log(`Home content seeded: ${section} (${items.length} items)`);
    }
  }

  private assertSection(section?: string) {
    if (section && !HOME_SECTIONS.includes(section as any)) {
      throw new BadRequestException(`Unknown section "${section}". Expected one of: ${HOME_SECTIONS.join(', ')}`);
    }
  }

  async findAll(query: { section?: string; status?: string } = {}) {
    this.assertSection(query.section);
    const filter: any = {};
    if (query.section) filter.section = query.section;
    if (query.status)  filter.status  = query.status;
    return this.homeContentModel.find(filter).sort({ section: 1, order: 1, created_at: 1 }).lean().exec();
  }

  /** All four sections in one call, keyed by section — used by the admin page. */
  async findGrouped() {
    const items = await this.homeContentModel.find().sort({ order: 1, created_at: 1 }).lean().exec();
    const grouped: Record<string, any[]> = {};
    for (const section of HOME_SECTIONS) grouped[section] = [];
    for (const item of items) {
      if (grouped[item.section]) grouped[item.section].push(item);
    }
    return grouped;
  }

  async findOne(id: string) {
    const item = await this.homeContentModel.findById(id).lean().exec();
    if (!item) throw new NotFoundException('Home content item not found');
    return item;
  }

  async create(data: any) {
    this.assertSection(data?.section);
    if (!data?.section) throw new BadRequestException('section is required');

    // Append to the end of its section unless an explicit order was given.
    if (data.order == null) {
      const last = await this.homeContentModel
        .findOne({ section: data.section })
        .sort({ order: -1 })
        .lean()
        .exec();
      data.order = last ? (last.order ?? 0) + 1 : 0;
    }

    const item = await new this.homeContentModel(data).save();
    this.logger.log(`Home content created: ${data.section}`);
    return item.toJSON();
  }

  async update(id: string, data: any) {
    this.assertSection(data?.section);
    // Section is fixed at creation — changing it would orphan the item's fields.
    const { section, ...rest } = data || {};
    const item = await this.homeContentModel.findByIdAndUpdate(id, rest, { new: true }).lean().exec();
    if (!item) throw new NotFoundException('Home content item not found');
    return item;
  }

  async remove(id: string) {
    const item = await this.homeContentModel.findByIdAndDelete(id).lean().exec();
    if (!item) throw new NotFoundException('Home content item not found');
    return { success: true };
  }

  /** Persist a new ordering: [{ id, order }, …] */
  async reorder(items: { id: string; order: number }[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Expected a non-empty array of { id, order }');
    }
    await this.homeContentModel.bulkWrite(
      items.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order } } },
      }))
    );
    return { success: true, updated: items.length };
  }
}
