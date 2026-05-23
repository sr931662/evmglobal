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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const leads_service_1 = require("./leads.service");
const upload_service_1 = require("../upload/upload.service");
const email_service_1 = require("../email/email.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_status_dto_1 = require("./dto/update-lead-status.dto");
let LeadsController = class LeadsController {
    leadsService;
    uploadService;
    emailService;
    logger = new common_1.Logger('LeadsController');
    constructor(leadsService, uploadService, emailService) {
        this.leadsService = leadsService;
        this.uploadService = uploadService;
        this.emailService = emailService;
    }
    /**
     * POST /api/leads
     * Public endpoint – anyone can submit a lead.
     */
    async create(body, file) {
        // Validate body fields
        const { error, value: sanitizedData } = create_lead_dto_1.createLeadSchema.validate(body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message,
            }));
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors,
            });
        }
        const leadData = sanitizedData;
        // Handle file upload
        if (file) {
            try {
                const uploadResult = await this.uploadService.uploadFile(file);
                leadData.fileUrl = uploadResult.secure_url;
            }
            catch (err) {
                this.logger.error(`File upload failed: ${err.message}`);
                throw new common_1.InternalServerErrorException('File upload failed');
            }
        }
        // Create lead
        const lead = await this.leadsService.createLead(leadData);
        // Send email notification (do not fail request if email fails)
        try {
            await this.emailService.sendLeadNotification(lead);
        }
        catch (emailError) {
            this.logger.error(`Email notification failed for lead ${lead.id}: ${emailError.message}`);
        }
        return {
            success: true,
            data: lead,
        };
    }
    /**
     * GET /api/leads
     * Admin only – list leads with pagination & filtering.
     */
    async findAll(query) {
        const page = Math.max(parseInt(query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
        const status = query.status || undefined;
        const search = query.search || undefined;
        return this.leadsService.findAll({ page, limit, status, search });
    }
    /**
     * GET /api/leads/:id
     * Admin only – single lead details.
     */
    async findOne(id) {
        const lead = await this.leadsService.findById(id);
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return lead;
    }
    /**
     * PUT /api/leads/:id
     * Admin only – update lead fields (name, phone, email, message, status).
     */
    async updateLead(id, body) {
        const allowed = ['name', 'phone', 'email', 'message', 'status'];
        const data = {};
        allowed.forEach(k => { if (body[k] !== undefined)
            data[k] = body[k]; });
        const lead = await this.leadsService.updateLead(id, data);
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return lead;
    }
    /**
     * PUT /api/leads/:id/status
     * Admin only – update lead status only (kept for backwards compat).
     */
    async updateStatus(id, body) {
        const { error, value } = update_lead_status_dto_1.updateLeadStatusSchema.validate(body, { stripUnknown: true });
        if (error) {
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
            });
        }
        const lead = await this.leadsService.updateStatus(id, value.status);
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return lead;
    }
    /**
     * DELETE /api/leads/:id
     * Admin only – delete a lead.
     */
    async deleteLead(id) {
        const result = await this.leadsService.deleteLead(id);
        if (!result)
            throw new common_1.NotFoundException('Lead not found');
        return result;
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateLead", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "deleteLead", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        upload_service_1.UploadService,
        email_service_1.EmailService])
], LeadsController);
