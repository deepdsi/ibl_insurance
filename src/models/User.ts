import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'reviewer' | 'provider';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'reviewer', 'provider'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
