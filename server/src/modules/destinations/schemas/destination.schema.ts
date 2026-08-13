import { Schema } from 'mongoose';

export const DestinationSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    region:  { type: String, required: true, enum: ['Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas'] },
    image:   { type: String, default: '' },

    // Marketing copy surfaced on package pages ("Krabi: island experiences,
    // limestone cliffs, beaches & sunsets") and the destination listing.
    blurb:      { type: String, default: '' },
    highlights: [{ type: String }],

    // Practical guidance shown in the package page's "Before You Book"
    // accordion. Left blank, the page falls back to a "we'll confirm this for
    // you" line rather than guessing.
    visaInfo: { type: String, default: '' },
    currency: { type: String, default: '' },
    bestTime: { type: String, default: '' },

    // How well this destination suits each kind of trip, 0–5. Drives the
    // "Help Me Choose" recommender and the at-a-glance score bars. A
    // destination with every score at 0 is simply never recommended — we'd
    // rather return nothing than rank on data nobody has entered.
    scores: {
      beach:     { type: Number, default: 0, min: 0, max: 5 },
      family:    { type: Number, default: 0, min: 0, max: 5 },
      honeymoon: { type: Number, default: 0, min: 0, max: 5 },
      adventure: { type: Number, default: 0, min: 0, max: 5 },
      culture:   { type: Number, default: 0, min: 0, max: 5 },
      nightlife: { type: Number, default: 0, min: 0, max: 5 },
    },

    // 1 = ₹, 2 = ₹₹, 3 = ₹₹₹ — a rough relative cost band, not a price.
    budgetLevel: { type: Number, default: 0, min: 0, max: 3 },

    // Month numbers (1–12) this destination is genuinely good to visit,
    // powering the "Travel by Month" browse.
    bestMonths: [{ type: Number, min: 1, max: 12 }],

    // Curated groupings, e.g. ['Honeymoon Escapes', 'Beach Holidays'].
    collections: [{ type: String, trim: true }],
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
