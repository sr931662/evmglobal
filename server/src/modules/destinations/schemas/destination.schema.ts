import { Schema } from 'mongoose';

export const DestinationSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    region:  { type: String, required: true, enum: ['Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas'] },
    image:   { type: String, default: '' },
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
