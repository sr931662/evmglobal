"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const common_module_1 = require("./common/common.module");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const leads_module_1 = require("./modules/leads/leads.module");
const export_module_1 = require("./modules/export/export.module");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const packages_module_1 = require("./modules/packages/packages.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const settings_module_1 = require("./modules/settings/settings.module");
const destinations_module_1 = require("./modules/destinations/destinations.module");
const quotes_module_1 = require("./modules/quotes/quotes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            leads_module_1.LeadsModule,
            export_module_1.ExportModule,
            whatsapp_module_1.WhatsAppModule,
            packages_module_1.PackagesModule,
            analytics_module_1.AnalyticsModule,
            settings_module_1.SettingsModule,
            destinations_module_1.DestinationsModule,
            quotes_module_1.QuotesModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard, // enable rate limiting globally
            },
        ],
    })
], AppModule);
