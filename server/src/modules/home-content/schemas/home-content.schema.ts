import { Schema } from 'mongoose';

export const HOME_SECTIONS = ['trust', 'gallery', 'testimonial', 'faq'] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];

/**
 * A single editable item on the home page. One collection backs all four
 * sections; `section` discriminates which fields are meaningful:
 *
 *   trust       → icon, title, subtitle
 *   gallery     → image, caption, span
 *   testimonial → name, trip, rating, quote
 *   faq         → question, answer, linkLabel, linkTo
 */
export const HomeContentSchema = new Schema(
  {
    section: { type: String, required: true, enum: HOME_SECTIONS, index: true },
    order:   { type: Number, default: 0 },
    status:  { type: String, enum: ['active', 'hidden'], default: 'active' },

    // ── Trust & Assurance ────────────────────────────────────────────────────
    icon:     { type: String, default: '', trim: true },
    title:    { type: String, default: '', trim: true },
    subtitle: { type: String, default: '', trim: true },

    // ── Gallery ──────────────────────────────────────────────────────────────
    image:   { type: String, default: '', trim: true },
    caption: { type: String, default: '', trim: true },
    span:    { type: String, enum: ['normal', 'wide', 'tall'], default: 'normal' },

    // ── Traveller stories ────────────────────────────────────────────────────
    name:   { type: String, default: '', trim: true },
    trip:   { type: String, default: '', trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    quote:  { type: String, default: '' },

    // ── FAQ ──────────────────────────────────────────────────────────────────
    question:  { type: String, default: '', trim: true },
    answer:    { type: String, default: '' },
    // Optional inline link rendered after the answer text
    linkLabel: { type: String, default: '', trim: true },
    linkTo:    { type: String, default: '', trim: true },
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

HomeContentSchema.index({ section: 1, order: 1 });
