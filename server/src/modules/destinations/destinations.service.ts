import { Injectable, OnModuleInit, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const SEED_DATA = [
  { name: 'Santorini',   country: 'Greece',                region: 'Europe',      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?auto=format&fit=crop&q=80&w=800' },
  { name: 'Kyoto',       country: 'Japan',                 region: 'Asia',        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Amalfi',      country: 'Italy',                 region: 'Europe',      image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800' },
  { name: 'Dubai',       country: 'UAE',                   region: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Maldives',    country: 'Republic of Maldives',  region: 'Oceania',     image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80&w=800' },
  { name: 'Swiss Alps',  country: 'Switzerland',           region: 'Europe',      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800' },
  { name: 'Bali',        country: 'Indonesia',             region: 'Asia',        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
  { name: 'Maasai Mara', country: 'Kenya',                 region: 'Africa',      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800' },
];

@Injectable()
export class DestinationsService implements OnModuleInit {
  private logger = new Logger('DestinationsService');

  constructor(@InjectModel('Destination') private destinationModel: Model<any>) {}

  async onModuleInit() {
    const count = await this.destinationModel.countDocuments();
    if (count === 0) {
      await this.destinationModel.insertMany(SEED_DATA);
      this.logger.log('Destinations seeded with default data');
    }
  }

  async findAll(query: { region?: string } = {}) {
    const filter: any = {};
    if (query.region) filter.region = query.region;
    return this.destinationModel.find(filter).sort({ name: 1 }).lean().exec();
  }

  async create(data: any) {
    const dest = await new this.destinationModel(data).save();
    this.logger.log(`Destination created: ${dest.name}`);
    return dest.toJSON();
  }

  async update(id: string, data: any) {
    const dest = await this.destinationModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async remove(id: string) {
    const dest = await this.destinationModel.findByIdAndDelete(id).lean().exec();
    if (!dest) throw new NotFoundException('Destination not found');
    return { success: true };
  }
}
