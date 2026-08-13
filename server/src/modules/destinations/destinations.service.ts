import { Injectable, OnModuleInit, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Seeded only on a fresh install (see onModuleInit). `blurb` and `highlights`
// feed the per-destination blocks on package pages; the visa/currency/season
// fields feed the "Before You Book" accordion. Visa lines are deliberately
// worded as guidance — entry rules change and are confirmed per passport.
const SEED_DATA = [
  {
    name: 'Santorini', country: 'Greece', region: 'Europe',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?auto=format&fit=crop&q=80&w=800',
    blurb: 'Whitewashed villages on a volcanic caldera, with some of the most photographed sunsets in the Mediterranean.',
    highlights: ['Caldera views from Oia', 'Sunset dinners', 'Volcanic black-sand beaches', 'Wine tasting and cliffside villages'],
    currency: 'Euro (EUR)',
    bestTime: 'Late April to early June and September to October — warm weather without peak-summer crowds.',
    visaInfo: 'Greece is in the Schengen Area, so a Schengen visa is required for most non-EU travellers. We confirm the current requirements for your passport and handle the application.',
  },
  {
    name: 'Kyoto', country: 'Japan', region: 'Asia',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    blurb: "Japan's old capital: temples, tea houses and preserved wooden streets, best explored slowly and on foot.",
    highlights: ['Temples and shrines', 'Traditional tea houses', 'Cherry blossom and autumn colour', 'Gion and the historic districts'],
    currency: 'Japanese Yen (JPY)',
    bestTime: 'Late March to April for cherry blossom, and November for autumn colour. Both are peak season, so we book well ahead.',
    visaInfo: 'A tourist visa is required for most travellers, with an online application available to several nationalities. We confirm the process for your passport and prepare the documentation.',
  },
  {
    name: 'Amalfi', country: 'Italy', region: 'Europe',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800',
    blurb: 'A cliffside coastline of pastel towns, lemon groves and slow lunches above the Tyrrhenian Sea.',
    highlights: ['Coastal drives and boat trips', 'Positano and Ravello', 'Seafood and lemon groves', 'Capri day trips'],
    currency: 'Euro (EUR)',
    bestTime: 'May to June and September — the coast is open and warm but noticeably quieter than August.',
    visaInfo: 'Italy is in the Schengen Area, so a Schengen visa is required for most non-EU travellers. We confirm the current requirements for your passport and handle the application.',
  },
  {
    name: 'Dubai', country: 'UAE', region: 'Middle East',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
    blurb: 'Skyline landmarks, desert on the doorstep and world-class shopping and dining — easy for first-time international travellers.',
    highlights: ['Burj Khalifa and the skyline', 'Desert safari with dinner', 'Beaches and marina cruises', 'Shopping and theme parks'],
    currency: 'UAE Dirham (AED)',
    bestTime: 'November to March, when daytime temperatures are comfortable for sightseeing and desert trips.',
    visaInfo: 'A tourist visa is required for most travellers and is usually arranged before departure. We confirm the current rules for your passport and process the visa as part of your booking.',
  },
  {
    name: 'Maldives', country: 'Republic of Maldives', region: 'Oceania',
    image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80&w=800',
    blurb: 'Overwater villas, house reefs and lagoons — the most straightforward luxury beach holiday there is.',
    highlights: ['Overwater villas', 'Snorkelling and house reefs', 'Seaplane transfers', 'Private sandbank dining'],
    currency: 'Maldivian Rufiyaa (MVR); US Dollars are widely accepted at resorts',
    bestTime: 'November to April, the dry season, with the calmest seas and clearest water.',
    visaInfo: 'A free short-stay visa is issued on arrival to most nationalities, subject to a confirmed resort booking and onward ticket. We confirm the current requirements before you travel.',
  },
  {
    name: 'Swiss Alps', country: 'Switzerland', region: 'Europe',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800',
    blurb: 'Mountain railways, lakeside towns and alpine peaks — spectacular in both snow and summer green.',
    highlights: ['Scenic mountain railways', 'Lakeside towns', 'Cable cars and peak excursions', 'Hiking and winter sports'],
    currency: 'Swiss Franc (CHF)',
    bestTime: 'December to March for snow and skiing; June to September for hiking, lakes and open mountain passes.',
    visaInfo: 'Switzerland is in the Schengen Area, so a Schengen visa is required for most non-EU travellers. We confirm the current requirements for your passport and handle the application.',
  },
  {
    name: 'Bali', country: 'Indonesia', region: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    blurb: 'Rice terraces, temples and surf beaches, with a resort for every budget and a strong wellness scene.',
    highlights: ['Rice terraces and Ubud', 'Beach clubs and surf', 'Temples and waterfalls', 'Spa and wellness retreats'],
    currency: 'Indonesian Rupiah (IDR)',
    bestTime: 'April to October, the dry season, with the most reliable beach and outdoor weather.',
    visaInfo: 'A visa on arrival is available to many nationalities for short stays. We confirm the current requirements for your passport and advise on the paperwork before departure.',
  },
  {
    name: 'Maasai Mara', country: 'Kenya', region: 'Africa',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    blurb: 'Open savannah and one of the densest concentrations of big game in Africa, including the Great Migration.',
    highlights: ['Big Five game drives', 'The Great Migration', 'Hot-air balloon safaris', 'Maasai cultural visits'],
    currency: 'Kenyan Shilling (KES)',
    bestTime: 'July to October for the Great Migration river crossings; game viewing is strong year-round.',
    visaInfo: 'Kenya requires advance electronic travel authorisation for most visitors. We confirm the current requirements for your passport and complete the application for you.',
  },
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
