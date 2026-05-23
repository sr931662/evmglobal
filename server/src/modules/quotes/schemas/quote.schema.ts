import { Schema } from 'mongoose';

const CostItemSchema = new Schema(
  { description: { type: String, default: '' }, amount: { type: Number, default: 0 } },
  { _id: false }
);

const FlightSchema = new Schema(
  {
    type:         { type: String, default: 'outbound', enum: ['outbound', 'return'] },
    airline:      { type: String, default: '' },
    flightNumber: { type: String, default: '' },
    from:         { type: String, default: '' },
    to:           { type: String, default: '' },
    departure:    { type: String, default: '' },
    arrival:      { type: String, default: '' },
    duration:     { type: String, default: '' },
    baggage:      { type: String, default: '' },
    class:        { type: String, default: 'Economy' },
  },
  { _id: false }
);

const HotelSchema = new Schema(
  {
    name:         { type: String, default: '' },
    stars:        { type: Number, default: 3 },
    location:     { type: String, default: '' },
    nights:       { type: Number, default: 1 },
    roomCategory: { type: String, default: '' },
    mealPlan:     { type: String, default: '' },
    address:      { type: String, default: '' },
  },
  { _id: false }
);

const ItineraryDaySchema = new Schema(
  {
    day:         { type: Number },
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

export const QuoteSchema = new Schema(
  {
    refNumber:    { type: String, unique: true },
    clientName:   { type: String, required: true, trim: true },
    clientEmail:  { type: String, trim: true, lowercase: true, default: '' },
    clientPhone:  { type: String, trim: true, default: '' },
    agentName:    { type: String, default: 'EMV Team' },
    validUntil:   { type: String, default: '' },
    tripTitle:    { type: String, required: true, trim: true },
    destinations: [{ type: String }],
    startDate:    { type: String, default: '' },
    nights:       { type: Number, default: 1 },
    pax:          { type: Number, default: 2 },
    tripType:     { type: String, default: 'Domestic', enum: ['Domestic', 'International'] },
    costItems:    { type: [CostItemSchema], default: [] },
    taxPercent:   { type: Number, default: 5 },
    currency:     { type: String, default: 'INR' },
    flights:      { type: [FlightSchema], default: [] },
    itinerary:    { type: [ItineraryDaySchema], default: [] },
    hotels:       { type: [HotelSchema], default: [] },
    inclusions:   [{ type: String }],
    exclusions:   [{ type: String }],
    notes:        [{ type: String }],
    terms:        [{ type: String }],
    status:       { type: String, default: 'Draft', enum: ['Draft', 'Sent', 'Accepted', 'Rejected'] },
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
