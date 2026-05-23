"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadStatusSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateLeadStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid('new', 'contacted', 'qualified', 'converted', 'rejected')
        .required()
        .messages({
        'any.only': 'Status must be one of: new, contacted, qualified, converted, rejected',
        'any.required': 'Status is required',
    }),
});
