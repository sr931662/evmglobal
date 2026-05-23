"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createLeadSchema = joi_1.default.object({
    name: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Name is required',
    }),
    phone: joi_1.default.string()
        .trim()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
        'string.pattern.base': 'Phone must be in E.164 format (e.g., +1234567890)',
        'any.required': 'Phone is required',
    }),
    email: joi_1.default.string()
        .email()
        .allow('', null)
        .optional()
        .messages({
        'string.email': 'Please provide a valid email address',
    }),
    message: joi_1.default.string()
        .max(1000)
        .allow('', null)
        .optional(),
    // file is handled by multer separately
});
