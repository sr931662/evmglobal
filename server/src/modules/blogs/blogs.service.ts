import { Injectable, NotFoundException } from '@nestjs/common';
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
export class BlogsService {
  constructor(@InjectModel('Blog') private blogModel: Model<any>) {}

  async findAll(query: { status?: string; category?: string; page?: number; limit?: number } = {}) {
    const filter: any = {};
    if (query.status)   filter.status   = query.status;
    if (query.category) filter.category = query.category;

    const page  = Math.max(query.page  || 1, 1);
    const limit = Math.min(query.limit || 20, 100);
    const skip  = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.blogModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean().exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return { blogs, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const blog = await this.blogModel.findById(id).lean().exec();
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async create(data: any) {
    const base = slugify(data.title || 'untitled');
    let slug = base;
    let suffix = 1;
    while (await this.blogModel.exists({ slug })) {
      slug = `${base}-${suffix++}`;
    }

    const publishedAt = data.status === 'published' ? new Date() : null;
    const blog = await new this.blogModel({ ...data, slug, publishedAt }).save();
    return blog.toJSON();
  }

  async update(id: string, data: any) {
    if (data.status === 'published') {
      const existing = await this.blogModel.findById(id).lean().exec() as any;
      if (existing && existing.status !== 'published') {
        data.publishedAt = new Date();
      }
    }
    const blog = await this.blogModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async remove(id: string) {
    const blog = await this.blogModel.findByIdAndDelete(id).lean().exec();
    if (!blog) throw new NotFoundException('Blog post not found');
    return { success: true };
  }
}
