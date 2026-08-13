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
