import { Schema } from 'mongoose';

// `placement` keys the slot in the UI where a banner can render.
// Add new keys here as new ad slots are wired into the frontend.
export const AD_PLACEMENTS = ['home-region-packages'];

export const AdSchema = new Schema(
  {
    placement:  { type: String, required: true, enum: AD_PLACEMENTS },
    title:      { type: String, required: true, trim: true },
    image:      { type: String, required: true },
    link:       { type: String, default: '' },
    linkTarget: { type: String, enum: ['_self', '_blank'], default: '_blank' },
    altText:    { type: String, default: '' },
    status:     { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    priority:   { type: Number, default: 0 },
    startDate:  { type: Date, default: null },
    endDate:    { type: Date, default: null },
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
