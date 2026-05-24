import { Schema } from 'mongoose';

export const TeamMemberSchema = new Schema(
  {
    name:       { type: String, required: true, trim: true },
    role:       { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    email:      { type: String, default: '', trim: true, lowercase: true },
    phone:      { type: String, default: '', trim: true },
    bio:        { type: String, default: '' },
    avatar:     { type: String, default: '' },
    status:     { type: String, enum: ['active', 'inactive'], default: 'active' },
    joinedAt:   { type: Date, default: null },
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
