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
exports.DestinationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const SEED_DATA = [
    { name: 'Santorini', country: 'Greece', region: 'Europe', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?auto=format&fit=crop&q=80&w=800' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Amalfi', country: 'Italy', region: 'Europe', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800' },
    { name: 'Dubai', country: 'UAE', region: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Maldives', country: 'Republic of Maldives', region: 'Oceania', image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80&w=800' },
    { name: 'Swiss Alps', country: 'Switzerland', region: 'Europe', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
    { name: 'Maasai Mara', country: 'Kenya', region: 'Africa', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800' },
];
let DestinationsService = class DestinationsService {
    destinationModel;
    logger = new common_1.Logger('DestinationsService');
    constructor(destinationModel) {
        this.destinationModel = destinationModel;
    }
    async onModuleInit() {
        const count = await this.destinationModel.countDocuments();
        if (count === 0) {
            await this.destinationModel.insertMany(SEED_DATA);
            this.logger.log('Destinations seeded with default data');
        }
    }
    async findAll(query = {}) {
        const filter = {};
        if (query.region)
            filter.region = query.region;
        return this.destinationModel.find(filter).sort({ name: 1 }).lean().exec();
    }
    async create(data) {
        const dest = await new this.destinationModel(data).save();
        this.logger.log(`Destination created: ${dest.name}`);
        return dest.toJSON();
    }
    async update(id, data) {
        const dest = await this.destinationModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
        if (!dest)
            throw new common_1.NotFoundException('Destination not found');
        return dest;
    }
    async remove(id) {
        const dest = await this.destinationModel.findByIdAndDelete(id).lean().exec();
        if (!dest)
            throw new common_1.NotFoundException('Destination not found');
        return { success: true };
    }
};
exports.DestinationsService = DestinationsService;
exports.DestinationsService = DestinationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Destination')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DestinationsService);
