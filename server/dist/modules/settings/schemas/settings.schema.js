"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.SettingsSchema = new mongoose_1.Schema({
    businessName: { type: String, default: 'EaseMyVacations Global' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    whatsappTemplate: { type: String, default: "Hi! I'd like to enquire about {packageName}. Please share details and availability." },
    notifications: {
        newLead: { type: Boolean, default: true },
        dailyDigest: { type: Boolean, default: true },
        conversionAlert: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false },
        lowStock: { type: Boolean, default: false },
    },
}, { timestamps: true });
