import { Schema } from 'mongoose';

const ActivitySchema = new Schema(
  { time: { type: String, default: '' }, description: { type: String, default: '' }, icon: { type: String, default: '📍' } },
  { _id: false }
);

const HotelSchema = new Schema(
  { name: { type: String, default: '' }, roomType: { type: String, default: '' }, checkIn: { type: String, default: '' }, checkOut: { type: String, default: '' } },
  { _id: false }
);

const DaySchema = new Schema(
  { day: { type: Number }, title: { type: String, default: '' }, note: { type: String, default: '' }, activities: { type: [ActivitySchema], default: [] }, hotel: { type: HotelSchema, default: null } },
  { _id: false }
);

const FlightSchema = new Schema(
  {
    type:         { type: String, default: 'Departure', enum: ['Departure', 'Return', 'Connecting'] },
    airline:      { type: String, default: '' },
    flightNumber: { type: String, default: '' },
    from:         { type: String, default: '' },
    to:           { type: String, default: '' },
    date:         { type: String, default: '' },
    time:         { type: String, default: '' },
  },
  { _id: false }
);

export const PackageSchema = new Schema(
  {
    title:        { type: String, required: true, trim: true },
    category:     { type: String, required: true, enum: ['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness'] },
    nights:       { type: Number, required: true, min: 1 },
    price:        { type: String, required: true },
    priceValue:   { type: Number, default: 0 },
    description:  { type: String, default: '' },
    highlights:   [{ type: String }],
    destinations: [{ type: String }],
    inclusions:   [{ type: String }],
    exclusions:   [{ type: String }],
    notes:        [{ type: String }],
    itinerary:    { type: [DaySchema], default: [] },
    flights:      { type: [FlightSchema], default: [] },
    status:       { type: String, default: 'Active', enum: ['Active', 'Draft'] },
    bookings:     { type: Number, default: 0 },
    image:        { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
