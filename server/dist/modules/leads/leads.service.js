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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LeadsService = class LeadsService {
    leadModel;
    logger = new common_1.Logger('LeadsService');
    constructor(leadModel) {
        this.leadModel = leadModel;
    }
    async createLead(data) {
        const lead = await new this.leadModel(data).save();
        this.logger.log(`New lead created with ID: ${lead._id}`);
        return lead.toJSON();
    }
    async findAll({ page = 1, limit = 10, status, search } = {}) {
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }
        const total = await this.leadModel.countDocuments(filter);
        const leads = await this.leadModel
            .find(filter)
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();
        return {
            leads,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        return this.leadModel.findById(id).lean().exec();
    }
    async updateLead(id, data) {
        const lead = await this.leadModel
            .findByIdAndUpdate(id, data, { new: true })
            .lean()
            .exec();
        if (!lead) {
            this.logger.warn(`Attempt to update non-existent lead ID: ${id}`);
            return null;
        }
        this.logger.log(`Lead ${id} updated`);
        return lead;
    }
    async deleteLead(id) {
        const lead = await this.leadModel.findByIdAndDelete(id).lean().exec();
        if (!lead) {
            this.logger.warn(`Attempt to delete non-existent lead ID: ${id}`);
            return null;
        }
        this.logger.log(`Lead ${id} deleted`);
        return { success: true };
    }
    async updateStatus(id, status) {
        const lead = await this.leadModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .lean()
            .exec();
        if (!lead) {
            this.logger.warn(`Attempt to update non-existent lead ID: ${id}`);
            return null;
        }
        this.logger.log(`Lead ${id} status updated to ${status}`);
        return lead;
    }
    async getFilteredLeads(filters = {}) {
        const filter = {};
        if (filters.status)
            filter.status = filters.status;
        if (filters.startDate || filters.endDate) {
            filter.created_at = {};
            if (filters.startDate)
                filter.created_at.$gte = new Date(filters.startDate);
            if (filters.endDate)
                filter.created_at.$lte = new Date(filters.endDate);
        }
        return this.leadModel.find(filter).sort({ created_at: -1 }).lean().exec();
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Lead')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LeadsService);
