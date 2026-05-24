import { Schema } from 'mongoose';

export const BlogSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt:     { type: String, default: '', trim: true },
    content:     { type: String, default: '' },
    category:    { type: String, default: 'Travel Tips', trim: true },
    coverImage:  { type: String, default: '' },
    author:      { type: String, default: 'EMV Global', trim: true },
    tags:        [{ type: String, trim: true }],
    status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
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
