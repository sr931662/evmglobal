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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const validation_pipe_1 = require("../../common/pipes/validation.pipe");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
let AuthController = class AuthController {
    authService;
    logger = new common_1.Logger('AuthController');
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Authenticate user with email and password.
     * Returns access token.
     */
    async login(body) {
        const { email, password } = body;
        const user = await this.authService.validateUser(email, password);
        const tokens = await this.authService.login(user);
        this.logger.log(`User ${user.email} logged in successfully`);
        return tokens;
    }
    /**
     * Refresh an expired access token using a valid refresh token.
     * (Optional – can be added later if you implement refresh token logic)
     */
    async refreshToken(body) {
        const { refreshToken } = body;
        const tokens = await this.authService.refreshAccessToken(refreshToken);
        this.logger.log('Token refreshed successfully');
        return tokens;
    }
    /**
     * Get current logged-in user profile.
     */
    getProfile(req) {
        return {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new validation_pipe_1.JoiValidationPipe(login_dto_1.loginSchema)),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new validation_pipe_1.JoiValidationPipe(refresh_token_dto_1.refreshTokenSchema)),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
