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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PackagesService = class PackagesService {
    packageModel;
    logger = new common_1.Logger('PackagesService');
    constructor(packageModel) {
        this.packageModel = packageModel;
    }
    normalize(doc) {
        if (!doc)
            return doc;
        const { _id, __v, ...rest } = doc;
        return { ...rest, id: _id.toString() };
    }
    async findAll(query = {}) {
        const filter = {};
        if (query.category)
            filter.category = query.category;
        if (query.status)
            filter.status = query.status;
        if (query.destination)
            filter.destinations = { $regex: `^${query.destination}$`, $options: 'i' };
        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: 'i' } },
                { category: { $regex: query.search, $options: 'i' } },
                { destinations: { $regex: query.search, $options: 'i' } },
            ];
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
            bestSeller: bestSeller?.title || 'N/A',
        };
    }
    async findById(id) {
        const pkg = await this.packageModel.findById(id).lean().exec();
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return this.normalize(pkg);
    }
    async create(data) {
        const pkg = await new this.packageModel(data).save();
        this.logger.log(`Package created: ${pkg.title}`);
        return this.normalize(pkg.toObject());
    }
    async update(id, data) {
        const pkg = await this.packageModel
            .findByIdAndUpdate(id, data, { new: true })
            .lean()
            .exec();
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return this.normalize(pkg);
    }
    async remove(id) {
        const pkg = await this.packageModel.findByIdAndDelete(id).lean().exec();
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return { success: true };
    }
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Package')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PackagesService);
