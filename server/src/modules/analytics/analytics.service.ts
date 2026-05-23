import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('Lead')    private leadModel:    Model<any>,
    @InjectModel('Quote')   private quoteModel:   Model<any>,
    @InjectModel('Package') private packageModel: Model<any>,
  ) {}

  async getSummary() {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      total, byStatus, monthly, recent, thisMonth, lastMonth,
      quotesByStatus, packagesTotal, packagesActive,
    ] = await Promise.all([
      this.leadModel.countDocuments(),

      this.leadModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      this.leadModel.aggregate([
        { $match: { created_at: { $gte: start } } },
        { $group: { _id: { y: { $year: '$created_at' }, m: { $month: '$created_at' } }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),

      this.leadModel.find().sort({ created_at: -1 }).limit(5).lean().exec(),

      this.leadModel.countDocuments({
        created_at: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }),

      this.leadModel.countDocuments({
        created_at: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          $lt:  new Date(now.getFullYear(), now.getMonth(), 1),
        },
      }),

      this.quoteModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      this.packageModel.countDocuments(),
      this.packageModel.countDocuments({ status: 'Active' }),
    ]);

    const statusMap: Record<string, number> = { new: 0, contacted: 0, qualified: 0, converted: 0, rejected: 0 };
    byStatus.forEach((s: any) => { if (s._id) statusMap[s._id] = s.count; });

    const quotesMap: Record<string, number> = { Draft: 0, Sent: 0, Accepted: 0, Rejected: 0 };
    quotesByStatus.forEach((s: any) => { if (s._id) quotesMap[s._id] = s.count; });
    const quotesTotal = Object.values(quotesMap).reduce((a, b) => a + b, 0);

    const converted   = statusMap.converted;
    const pending     = statusMap.new + statusMap.contacted;
    const convRate    = total > 0 ? +((converted / total) * 100).toFixed(1) : 0;
    const monthChange = lastMonth > 0 ? +(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;

    const monthlyMap: Record<string, number> = {};
    (monthly as any[]).forEach(m => {
      monthlyMap[`${m._id.y}-${m._id.m}`] = m.count;
    });
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      return { month: MONTH_NAMES[d.getMonth()], leads: monthlyMap[key] || 0 };
    });

    // Normalize recent leads: _id (ObjectId) → id (string)
    const recentNormalized = (recent as any[]).map(({ _id, __v, ...rest }) => ({
      ...rest,
      id: _id.toString(),
    }));

    return {
      total,
      converted,
      pending,
      byStatus: statusMap,
      conversionRate: convRate,
      thisMonth,
      monthChange,
      monthlyData,
      recent: recentNormalized,
      quotes: {
        total:    quotesTotal,
        draft:    quotesMap.Draft,
        sent:     quotesMap.Sent,
        accepted: quotesMap.Accepted,
        rejected: quotesMap.Rejected,
      },
      packages: {
        total:  packagesTotal,
        active: packagesActive,
      },
    };
  }

  async getWeeklyActivity() {
    const now = new Date();
    const dayOfWeek    = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday       = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);

    const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [inquiriesByDay, quotesByDay] = await Promise.all([
      // Inquiries = new leads created this week
      this.leadModel.aggregate([
        { $match: { created_at: { $gte: monday } } },
        { $group: { _id: { $dayOfWeek: '$created_at' }, count: { $sum: 1 } } },
      ]),
      // Quotes = actual Quote documents created this week
      this.quoteModel.aggregate([
        { $match: { created_at: { $gte: monday } } },
        { $group: { _id: { $dayOfWeek: '$created_at' }, count: { $sum: 1 } } },
      ]),
    ]);

    // MongoDB $dayOfWeek: 1=Sun, 2=Mon, ..., 7=Sat → Mon-Sun index (0–6)
    const toMonSunIdx = (mongoDay: number) => (mongoDay === 1 ? 6 : mongoDay - 2);

    const inquiriesMap: Record<number, number> = {};
    inquiriesByDay.forEach((d: any) => { inquiriesMap[toMonSunIdx(d._id)] = d.count; });

    const quotesMap: Record<number, number> = {};
    quotesByDay.forEach((d: any) => { quotesMap[toMonSunIdx(d._id)] = d.count; });

    return DAY_NAMES.map((day, idx) => ({
      day,
      inquiries: inquiriesMap[idx] || 0,
      quotes:    quotesMap[idx]    || 0,
    }));
  }
}
