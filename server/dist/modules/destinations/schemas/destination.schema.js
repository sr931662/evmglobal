"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.DestinationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    region: { type: String, required: true, enum: ['Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas'] },
    image: { type: String, default: '' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        },
    },
});
