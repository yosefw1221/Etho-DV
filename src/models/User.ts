import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'user' | 'agent' | 'admin' | 'operator';
  language_preference: 'en' | 'am' | 'ti' | 'or';
  // Agent-specific fields
  business_name?: string;
  total_submissions?: number;
  current_tier?: 'bronze' | 'silver' | 'gold';
  discount_rate?: number;
  created_at: Date;
  updated_at: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin', 'operator'],
      default: 'user',
    },
    language_preference: {
      type: String,
      enum: ['en', 'am', 'ti', 'or'],
      default: 'en',
    },
    // Agent-specific fields
    business_name: {
      type: String,
      required: function (this: IUser) {
        return this.role === 'agent';
      },
    },
    total_submissions: {
      type: Number,
      default: 0,
    },
    current_tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze',
    },
    discount_rate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Update tier and discount rate based on total submissions
UserSchema.pre('save', function (next) {
  if (this.role === 'agent' && this.isModified('total_submissions')) {
    const submissions = Number(this.total_submissions) || 0;

    if (submissions >= 50) {
      this.current_tier = 'gold';
      this.discount_rate = 50; // 50 ETB per form
    } else if (submissions >= 11) {
      this.current_tier = 'silver';
      this.discount_rate = 75; // 75 ETB per form
    } else {
      this.current_tier = 'bronze';
      this.discount_rate = 100; // 100 ETB per form
    }
  }
  next();
});

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
