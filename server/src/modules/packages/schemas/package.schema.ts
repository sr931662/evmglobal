import { Schema } from 'mongoose';

const ActivitySchema = new Schema(
  { time: { type: String, default: '' }, description: { type: String, default: '' }, icon: { type: String, default: '📍' } },
  { _id: false }
);

const DayHotelRefSchema = new Schema(
  { name: { type: String, default: '' }, roomType: { type: String, default: '' }, checkIn: { type: String, default: '' }, checkOut: { type: String, default: '' } },
  { _id: false }
);

const DaySchema = new Schema(
  {
    day:           { type: Number },
    title:         { type: String, default: '' },
    note:          { type: String, default: '' },
    activities:    { type: [ActivitySchema], default: [] },
    hotel:         { type: DayHotelRefSchema, default: null },
    transport:     { type: String, default: '' },
    mealsIncluded: { type: [String], default: [] },
  },
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
    arrivalTime:  { type: String, default: '' },
    duration:     { type: String, default: '' },
    stops:        { type: String, default: '0' },
    cabinClass:   { type: String, default: 'Economy', enum: ['Economy', 'Premium Economy', 'Business', 'First Class'] },
    baggage:      { type: String, default: '' },
    meal:         { type: String, default: '' },
    pnr:          { type: String, default: '' },
    terminal:     { type: String, default: '' },
  },
  { _id: false }
);

const PackageHotelSchema = new Schema(
  {
    name:      { type: String, default: '' },
    location:  { type: String, default: '' },
    stars:     { type: Number, default: 4, min: 1, max: 5 },
    roomType:  { type: String, default: '' },
    mealPlan:  { type: String, default: 'CP', enum: ['EP', 'CP', 'MAP', 'AP', 'AI', 'UAI'] },
    nights:    { type: Number, default: null },
    checkIn:   { type: String, default: '' },
    checkOut:  { type: String, default: '' },
    amenities: { type: String, default: '' },
    address:   { type: String, default: '' },
    contact:   { type: String, default: '' },
  },
  { _id: false }
);

export const PackageSchema = new Schema(
  {
    title:        { type: String, required: true, trim: true },
    slug:         { type: String, unique: true, lowercase: true, sparse: true },
    category:     { type: String, required: true, enum: ['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness'] },
    nights:       { type: Number, required: true, min: 1 },
    price:        { type: String, required: true },
    priceValue:   { type: Number, default: 0 },
    description:  { type: String, default: '' },
    highlights:   [{ type: String }],
    destinations: [{ type: String }],
    inclusions:      [{ type: String }],
    exclusions:      [{ type: String }],
    notes:           [{ type: String }],
    contentMarkdown: { type: String, default: '' },
    itinerary:    { type: [DaySchema], default: [] },
    flights:      { type: [FlightSchema], default: [] },
    hotels:       { type: [PackageHotelSchema], default: [] },
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
