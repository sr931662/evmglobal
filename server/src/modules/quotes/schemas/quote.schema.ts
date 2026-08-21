import { Schema } from 'mongoose';

const CostItemSchema = new Schema(
  { description: { type: String, default: '' }, amount: { type: Number, default: 0 } },
  { _id: false }
);

const TaxSchema = new Schema(
  { name: { type: String, default: 'GST' }, percent: { type: Number, default: 0 } },
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

/** A hotel category the client can choose between — "Option 1 · 4★", "Option 2 · 5★" … */
const HotelOptionSchema = new Schema(
  {
    label:               { type: String, default: '' },
    category:            { type: String, default: '' },
    supplementPerAdult:  { type: Number, default: 0 },
    supplementPerChild:  { type: Number, default: 0 },
    hotels:              { type: [HotelSchema], default: [] },
  },
  { _id: false }
);

/** A city on the trip and how many nights are spent there. */
const DestinationStaySchema = new Schema(
  { city: { type: String, default: '' }, nights: { type: Number, default: 0 } },
  { _id: false }
);

const ItineraryDaySchema = new Schema(
  {
    day:         { type: Number },
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    note:        { type: String, default: '' },
    image:       { type: String, default: '' },
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
    // Nights per city, so a quote can say "Dubai — 3N · Abu Dhabi — 2N".
    // Quotes saved before this existed fall back to the hotel list.
    destinationStays: { type: [DestinationStaySchema], default: [] },
    // ISO (YYYY-MM-DD) from the date picker; older quotes hold free text.
    startDate:    { type: String, default: '' },
    nights:       { type: Number, default: 1 },
    pax:          { type: Number, default: 2 },
    adults:       { type: Number, default: 2 },
    children:     { type: Number, default: 0 },
    // Age of each child. Hotels and airlines price by age, so this is what
    // lets a child be added to the booking as a passenger.
    childAges:    { type: [Number], default: [] },
    perAdult:     { type: Number, default: 0 },
    perChild:     { type: Number, default: 0 },
    tripType:     { type: String, default: 'Domestic', enum: ['Domestic', 'International'] },
    costItems:    { type: [CostItemSchema], default: [] },
    taxes:        { type: [TaxSchema], default: [] },
    // Legacy single-rate tax, kept so quotes created before named taxes still price correctly.
    taxPercent:   { type: Number, default: 0 },
    // Discount comes off the post-tax total
    discountLabel: { type: String, default: '' },
    discountType:  { type: String, default: 'flat', enum: ['flat', 'percent'] },
    discountValue: { type: Number, default: 0 },
    currency:     { type: String, default: 'INR' },
    flights:      { type: [FlightSchema], default: [] },
    itinerary:    { type: [ItineraryDaySchema], default: [] },
    hotelOptions: { type: [HotelOptionSchema], default: [] },
    // Legacy flat hotel list, still read when no options are defined.
    hotels:       { type: [HotelSchema], default: [] },
    // Markdown note boxes (current format)
    inclusionsMd: { type: String, default: '' },
    exclusionsMd: { type: String, default: '' },
    notesMd:      { type: String, default: '' },
    termsMd:      { type: String, default: '' },
    // Legacy line-item lists, still read when the markdown field is empty.
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
