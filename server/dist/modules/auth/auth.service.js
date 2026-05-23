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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    logger = new common_1.Logger('AuthService');
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    /**
     * Validates user credentials.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} user object without password
     */
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            this.logger.warn(`Login attempt for non-existent email: ${email}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            this.logger.warn(`Failed password attempt for user: ${email}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        // Remove sensitive fields before returning
        const { password: _, ...result } = user;
        return result;
    }
    /**
     * Generates access token (and optional refresh token).
     * @param {Object} user - User object (must contain id, email, role)
     * @returns {Promise<{access_token: string, refresh_token?: string}>}
     */
    async login(user) {
        const id = user._id?.toString() || user.id;
        const payload = { sub: id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        // Optional: generate a refresh token (longer-lived)
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d'),
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: process.env.JWT_EXPIRY || '1h',
        };
    }
    /**
     * Refreshes the access token using a valid refresh token.
     * Validates the refresh token and issues a new access token.
     * @param {string} token - The refresh token
     * @returns {Promise<{access_token: string, refresh_token: string}>}
     */
    async refreshAccessToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
                ignoreExpiration: false,
            });
            // Verify user still exists
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            // Issue new tokens (rotation)
            return this.login({ _id: user._id, email: user.email, role: user.role });
        }
        catch (error) {
            this.logger.warn(`Invalid refresh token: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
