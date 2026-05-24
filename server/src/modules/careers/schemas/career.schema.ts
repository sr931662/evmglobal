import { Schema } from 'mongoose';

export const CareerSchema = new Schema(
  {
    title:        { type: String, required: true, trim: true },
    department:   { type: String, required: true, trim: true },
    location:     { type: String, default: 'Gurugram', trim: true },
    type:         { type: String, enum: ['Full-time', 'Part-time', 'Remote', 'Hybrid'], default: 'Full-time' },
    description:  { type: String, required: true },
    requirements: [{ type: String, trim: true }],
    status:       { type: String, enum: ['open', 'closed'], default: 'open' },
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
