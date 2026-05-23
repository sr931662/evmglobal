"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageSchema = void 0;
const mongoose_1 = require("mongoose");
const ActivitySchema = new mongoose_1.Schema({ time: { type: String, default: '' }, description: { type: String, default: '' }, icon: { type: String, default: '📍' } }, { _id: false });
const DaySchema = new mongoose_1.Schema({ day: { type: Number }, title: { type: String, default: '' }, activities: { type: [ActivitySchema], default: [] } }, { _id: false });
exports.PackageSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness'] },
    nights: { type: Number, required: true, min: 1 },
    price: { type: String, required: true },
    priceValue: { type: Number, default: 0 },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    destinations: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: { type: [DaySchema], default: [] },
    status: { type: String, default: 'Active', enum: ['Active', 'Draft'] },
    bookings: { type: Number, default: 0 },
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
