import { Schema } from 'mongoose';

// Per-article FAQ, rendered as an accordion and as FAQ rich-result markup.
const BlogFaqSchema = new Schema(
  { q: { type: String, default: '' }, a: { type: String, default: '' } },
  { _id: false }
);

export const BlogSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt:     { type: String, default: '', trim: true },
    content:     { type: String, default: '' },
    category:    { type: String, default: 'Travel Tips', trim: true },
    coverImage:  { type: String, default: '' },
    coverAlt:    { type: String, default: '', trim: true },
    author:      { type: String, default: 'Ease My Vacations Travel Team', trim: true },
    tags:        [{ type: String, trim: true }],
    status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },

    // Editorial curation for the journal landing page.
    featured:    { type: Boolean, default: false },  // the one large hero article
    editorsPick: { type: Boolean, default: false },  // the curated "Editor's Picks" rail

    // Read count, incremented when an article is opened. "Trending" is ranked
    // on this rather than on recency, so the label stays truthful.
    views:       { type: Number, default: 0 },

    // Which destination this article sells, so the article can show a
    // destination-specific CTA and the matching holidays.
    destination: { type: String, default: '', trim: true },

    faqs:        { type: [BlogFaqSchema], default: [] },
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
