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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const json2csv_1 = require("json2csv");
const leads_service_1 = require("../leads/leads.service");
let ExportService = class ExportService {
    leadsService;
    logger = new common_1.Logger('ExportService');
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async streamCsv(res, filters = {}) {
        const leads = await this.leadsService.getFilteredLeads(filters);
        const fields = [
            { label: 'ID', value: 'id' },
            { label: 'Name', value: 'name' },
            { label: 'Phone', value: 'phone' },
            { label: 'Email', value: 'email' },
            { label: 'Message', value: 'message' },
            { label: 'File URL', value: 'file_url' },
            { label: 'Status', value: 'status' },
            { label: 'Created At', value: 'created_at' },
        ];
        const transform = new json2csv_1.Transform({ fields, withBOM: true });
        transform.pipe(res);
        try {
            for (const lead of leads) {
                transform.write(lead);
            }
        }
        catch (error) {
            this.logger.error(`Error streaming CSV: ${error.message}`);
            throw error;
        }
        finally {
            transform.end();
        }
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], ExportService);
