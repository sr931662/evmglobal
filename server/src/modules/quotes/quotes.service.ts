import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class QuotesService {
  private logger = new Logger('QuotesService');

  constructor(@InjectModel('Quote') private quoteModel: Model<any>) {}

  private async generateRef(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EMV-Q-${year}-`;
    const latest = await this.quoteModel
      .findOne({ refNumber: { $regex: `^${prefix}` } })
      .sort({ refNumber: -1 })
      .select('refNumber')
      .lean()
      .exec();

    let seq = 1;
    if (latest) {
      const parts = (latest as any).refNumber.split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  private normalize(doc: any) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id.toString() };
  }

  async findAll(query: { search?: string; status?: string } = {}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { refNumber:    { $regex: query.search, $options: 'i' } },
        { clientName:   { $regex: query.search, $options: 'i' } },
        { tripTitle:    { $regex: query.search, $options: 'i' } },
        { destinations: { $regex: query.search, $options: 'i' } },
      ];
    }
    const docs = await this.quoteModel.find(filter).sort({ created_at: -1 }).lean().exec();
    return docs.map(d => this.normalize(d));
  }

  async findById(id: string) {
    const quote = await this.quoteModel.findById(id).lean().exec();
    if (!quote) throw new NotFoundException('Quote not found');
    return this.normalize(quote);
  }

  async create(data: any) {
    const refNumber = await this.generateRef();
    // Strip any id/_id the client may have sent to prevent dup-key errors
    const { id: _id2, _id, __v, refNumber: _rn, ...clean } = data;
    const quote = await new this.quoteModel({ ...clean, refNumber }).save();
    this.logger.log(`Quote created: ${quote.refNumber}`);
    return quote.toJSON();
  }

  async update(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quote ID');
    const { id: _id2, _id, __v, refNumber, ...clean } = data;
    const quote = await this.quoteModel
      .findByIdAndUpdate(id, clean, { new: true })
      .lean()
      .exec();
    if (!quote) throw new NotFoundException('Quote not found');
    return this.normalize(quote);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid quote ID');
    const quote = await this.quoteModel.findByIdAndDelete(id).lean().exec();
    if (!quote) throw new NotFoundException('Quote not found');
    return { success: true };
  }

  async findByRef(refNumber: string, phone?: string) {
    const quote = await this.quoteModel
      .findOne({ refNumber: { $regex: `^${refNumber}$`, $options: 'i' } })
      .lean()
      .exec();

    if (!quote) throw new NotFoundException('Quote not found');
    if (!['Sent', 'Accepted'].includes((quote as any).status))
      throw new NotFoundException('Quote not available');

    // If phone provided, verify it matches (basic security)
    if (phone) {
      const stored = ((quote as any).clientPhone || '').replace(/\D/g, '');
      const given  = phone.replace(/\D/g, '');
      if (stored && given && !stored.endsWith(given.slice(-10)))
        throw new NotFoundException('Quote not found');
    }

    return this.normalize(quote);
  }

  async getStats() {
    const [total, sent, accepted] = await Promise.all([
      this.quoteModel.countDocuments(),
      this.quoteModel.countDocuments({ status: 'Sent' }),
      this.quoteModel.countDocuments({ status: 'Accepted' }),
    ]);
    return { total, sent, accepted };
  }
}
