import { Schema } from 'mongoose';

// `placement` keys the slot in the UI where a banner can render.
// Add new keys here as new ad slots are wired into the frontend.
export const AD_PLACEMENTS = [
  'home-top',
  'home-mid',
  'home-bottom',
  // Kept so banners created against the old single slot still resolve; it now
  // renders under the destinations row on the homepage.
  'home-region-packages',
  'packages-list',
  'blog-list',
];

// How the creative is sized in its slot. Full-bleed is the default because
// that's how the existing banners were authored.
export const AD_WIDTHS = ['full', 'wide', 'medium', 'narrow'];
export const AD_RATIOS = ['auto', '21:9', '16:9', '4:1', '3:1', '2:1', '1:1'];

export const AdSchema = new Schema(
  {
    placement:  { type: String, required: true, enum: AD_PLACEMENTS },
    title:      { type: String, required: true, trim: true },
    image:      { type: String, required: true },
    link:       { type: String, default: '' },
    linkTarget: { type: String, enum: ['_self', '_blank'], default: '_blank' },
    altText:    { type: String, default: '' },
    // ── Sizing, so a banner can be fitted to its artwork rather than being
    // stretched to whatever the slot happens to be.
    width:       { type: String, enum: AD_WIDTHS, default: 'full' },
    aspectRatio: { type: String, enum: AD_RATIOS, default: 'auto' },
    // 'cover' crops to fill the frame, 'contain' shows the whole creative.
    objectFit:   { type: String, enum: ['cover', 'contain'], default: 'cover' },
    rounded:     { type: Boolean, default: true },
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
