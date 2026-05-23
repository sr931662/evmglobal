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
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
let WhatsAppService = class WhatsAppService {
    logger = new common_1.Logger('WhatsAppService');
    defaultCountryCode = '91';
    constructor() { }
    /**
     * Generates a WhatsApp deep link for a given phone number and optional message.
     * @param {string} phoneNumber - Raw phone number (may contain spaces, +, dashes)
     * @param {string} [message] - Pre‑filled message (will be URL‑encoded)
     * @returns {string} WhatsApp deep‑link URL
     */
    generateDeepLink(phoneNumber, message = '') {
        const sanitized = this.sanitizeNumber(phoneNumber);
        const encodedMessage = encodeURIComponent(message);
        const baseUrl = `https://wa.me/${sanitized}`;
        return encodedMessage ? `${baseUrl}?text=${encodedMessage}` : baseUrl;
    }
    /**
     * Sanitizes a phone number by removing non‑digit characters and adding a default country code if missing.
     * @param {string} phone - Input phone
     * @returns {string} Digits only, with country code
     */
    sanitizeNumber(phone) {
        let digits = phone.replace(/\D/g, '');
        if (digits.length === 10 && !digits.startsWith('1')) {
            // Assume India if 10 digits and no country code
            digits = this.defaultCountryCode + digits;
        }
        return digits;
    }
    /**
     * Returns a WhatsApp deep‑link for a lead (uses name and message).
     * @param {Object} lead - Lead object { name, phone, message? }
     * @returns {string}
     */
    generateLeadLink(lead) {
        const template = this.buildLeadMessage(lead);
        return this.generateDeepLink(lead.phone, template);
    }
    /**
     * Builds a default message for a lead.
     * @param {Object} lead
     * @returns {string}
     */
    buildLeadMessage(lead) {
        const base = `Hello ${lead.name}, thanks for your interest!`;
        if (lead.message) {
            return `${base} We received your message: "${lead.message}"`;
        }
        return `${base} We'll get back to you shortly.`;
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WhatsAppService);
