"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let AnalyticsService = class AnalyticsService {
    leadModel;
    quoteModel;
    packageModel;
    constructor(leadModel, quoteModel, packageModel) {
        this.leadModel = leadModel;
        this.quoteModel = quoteModel;
        this.packageModel = packageModel;
    }
    async getSummary() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const [total, byStatus, monthly, recent, thisMonth, lastMonth, quotesByStatus, packagesTotal, packagesActive,] = await Promise.all([
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
                    $lt: new Date(now.getFullYear(), now.getMonth(), 1),
                },
            }),
            this.quoteModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.packageModel.countDocuments(),
            this.packageModel.countDocuments({ status: 'Active' }),
        ]);
        const statusMap = { new: 0, contacted: 0, qualified: 0, converted: 0, rejected: 0 };
        byStatus.forEach((s) => { if (s._id)
            statusMap[s._id] = s.count; });
        const quotesMap = { Draft: 0, Sent: 0, Accepted: 0, Rejected: 0 };
        quotesByStatus.forEach((s) => { if (s._id)
            quotesMap[s._id] = s.count; });
        const quotesTotal = Object.values(quotesMap).reduce((a, b) => a + b, 0);
        const converted = statusMap.converted;
        const pending = statusMap.new + statusMap.contacted;
        const convRate = total > 0 ? +((converted / total) * 100).toFixed(1) : 0;
        const monthChange = lastMonth > 0 ? +(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;
        const monthlyMap = {};
        monthly.forEach(m => {
            monthlyMap[`${m._id.y}-${m._id.m}`] = m.count;
        });
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            return { month: MONTH_NAMES[d.getMonth()], leads: monthlyMap[key] || 0 };
        });
        // Normalize recent leads: _id (ObjectId) → id (string)
        const recentNormalized = recent.map(({ _id, __v, ...rest }) => ({
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
                total: quotesTotal,
                draft: quotesMap.Draft,
                sent: quotesMap.Sent,
                accepted: quotesMap.Accepted,
                rejected: quotesMap.Rejected,
            },
            packages: {
                total: packagesTotal,
                active: packagesActive,
            },
        };
    }
    async getWeeklyActivity() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
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
        const toMonSunIdx = (mongoDay) => (mongoDay === 1 ? 6 : mongoDay - 2);
        const inquiriesMap = {};
        inquiriesByDay.forEach((d) => { inquiriesMap[toMonSunIdx(d._id)] = d.count; });
        const quotesMap = {};
        quotesByDay.forEach((d) => { quotesMap[toMonSunIdx(d._id)] = d.count; });
        return DAY_NAMES.map((day, idx) => ({
            day,
            inquiries: inquiriesMap[idx] || 0,
            quotes: quotesMap[idx] || 0,
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Lead')),
    __param(1, (0, mongoose_1.InjectModel)('Quote')),
    __param(2, (0, mongoose_1.InjectModel)('Package')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
