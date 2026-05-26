import { Schema } from 'mongoose';

export const LeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    message: { type: String, default: null },
    city:    { type: String, default: null },
    file_url: { type: String, default: null },
    type: {
      type: String,
      default: 'lead',
      enum: ['lead', 'inquiry', 'signup'],
    },
    destination: { type: String, default: null },
    travelDate: { type: String, default: null },
    travellers: { type: String, default: null },
    status: {
      type: String,
      default: 'new',
      enum: ['new', 'contacted', 'qualified', 'converted', 'rejected', 'duplicate', 'not_interested'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
