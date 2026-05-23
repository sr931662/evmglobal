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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const export_service_1 = require("./export.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ExportController = class ExportController {
    exportService;
    logger = new common_1.Logger('ExportController');
    constructor(exportService) {
        this.exportService = exportService;
    }
    /**
     * GET /api/export/leads
     * Exports all leads (or filtered) as a CSV file.
     * Query params:
     *  - status (optional): filter by lead status
     *  - startDate (optional): ISO date string, start of range
     *  - endDate (optional): ISO date string, end of range
     */
    async exportLeads(res, status, startDate, endDate) {
        const requestId = res.req.headers['x-request-id'] || 'no-id';
        this.logger.log(`[${requestId}] CSV export requested with filters: status=${status}, startDate=${startDate}, endDate=${endDate}`);
        try {
            // Set headers for CSV download
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
            // Prevent caching
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');
            // Stream CSV data to response
            await this.exportService.streamCsv(res, { status, startDate, endDate });
            this.logger.log(`[${requestId}] CSV export completed successfully`);
        }
        catch (error) {
            this.logger.error(`[${requestId}] CSV export failed: ${error.message}`);
            // If headers haven't been sent, return JSON error
            if (!res.headersSent) {
                res.status(500).json({
                    statusCode: 500,
                    message: 'Failed to export leads',
                });
            }
        }
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('leads'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportLeads", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ExportController);
