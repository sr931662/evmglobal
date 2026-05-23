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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
let UsersService = class UsersService {
    userModel;
    logger = new common_1.Logger('UsersService');
    saltRounds = 10;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email: email.toLowerCase() }).lean().exec();
    }
    async findById(id) {
        return this.userModel.findById(id).lean().exec();
    }
    async create(userData) {
        const { email, password, role = 'admin' } = userData;
        const existing = await this.findByEmail(email);
        if (existing) {
            throw new common_1.ConflictException(`User with email ${email} already exists`);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, this.saltRounds);
        try {
            const user = await new this.userModel({
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
            }).save();
            this.logger.log(`User created: ${user.email}`);
            const { password: _p, ...result } = user.toJSON();
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to create user ${email}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Could not create user');
        }
    }
    async findAll() {
        return this.userModel
            .find()
            .select('-password')
            .sort({ created_at: -1 })
            .lean()
            .exec();
    }
    async updateRole(id, role) {
        const validRoles = ['admin'];
        if (!validRoles.includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        return this.userModel
            .findByIdAndUpdate(id, { role }, { new: true })
            .select('-password')
            .lean()
            .exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
