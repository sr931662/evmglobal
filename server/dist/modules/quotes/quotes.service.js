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
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let QuotesService = class QuotesService {
    quoteModel;
    logger = new common_1.Logger('QuotesService');
    constructor(quoteModel) {
        this.quoteModel = quoteModel;
    }
    async generateRef() {
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
            const parts = latest.refNumber.split('-');
            seq = parseInt(parts[parts.length - 1], 10) + 1;
        }
        return `${prefix}${String(seq).padStart(3, '0')}`;
    }
    normalize(doc) {
        if (!doc)
            return doc;
        const { _id, __v, ...rest } = doc;
        return { ...rest, id: _id.toString() };
    }
    async findAll(query = {}) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.search) {
            filter.$or = [
                { refNumber: { $regex: query.search, $options: 'i' } },
                { clientName: { $regex: query.search, $options: 'i' } },
                { tripTitle: { $regex: query.search, $options: 'i' } },
                { destinations: { $regex: query.search, $options: 'i' } },
            ];
        }
        const docs = await this.quoteModel.find(filter).sort({ created_at: -1 }).lean().exec();
        return docs.map(d => this.normalize(d));
    }
    async findById(id) {
        const quote = await this.quoteModel.findById(id).lean().exec();
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        return this.normalize(quote);
    }
    async create(data) {
        const refNumber = await this.generateRef();
        // Strip any id/_id the client may have sent to prevent dup-key errors
        const { id: _id2, _id, __v, refNumber: _rn, ...clean } = data;
        const quote = await new this.quoteModel({ ...clean, refNumber }).save();
        this.logger.log(`Quote created: ${quote.refNumber}`);
        return quote.toJSON();
    }
    async update(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quote ID');
        const { id: _id2, _id, __v, refNumber, ...clean } = data;
        const quote = await this.quoteModel
            .findByIdAndUpdate(id, clean, { new: true })
            .lean()
            .exec();
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        return this.normalize(quote);
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('Invalid quote ID');
        const quote = await this.quoteModel.findByIdAndDelete(id).lean().exec();
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        return { success: true };
    }
    async findByRef(refNumber, phone) {
        const quote = await this.quoteModel
            .findOne({ refNumber: { $regex: `^${refNumber}$`, $options: 'i' } })
            .lean()
            .exec();
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        if (!['Sent', 'Accepted'].includes(quote.status))
            throw new common_1.NotFoundException('Quote not available');
        // If phone provided, verify it matches (basic security)
        if (phone) {
            const stored = (quote.clientPhone || '').replace(/\D/g, '');
            const given = phone.replace(/\D/g, '');
            if (stored && given && !stored.endsWith(given.slice(-10)))
                throw new common_1.NotFoundException('Quote not found');
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
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Quote')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuotesService);
