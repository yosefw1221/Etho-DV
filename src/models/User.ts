import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  password: string;
  name: string;
  phone?: string;
  role: 'user' | 'agent' | 'admin' | 'operator';
  language_preference: 'en' | 'am' | 'ti' | 'or';

  // Referral system fields
  referral_code: string;
  referred_by?: string;
  referral_earnings: number;
  total_referrals: number;

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
      required: false,
      unique: true,
      sparse: true, // Allow multiple null values
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
      minlength: [4, 'Password must be at least 4 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin', 'operator'],
      required: true,
    },
    language_preference: {
      type: String,
      enum: ['en', 'am', 'ti', 'or'],
      default: 'en',
    },

    // Referral system fields
    referral_code: {
      type: String,
      required: false,
      sparse: true, // Allow multiple null values for unique constraint
      trim: true,
    },
    referred_by: {
      type: String,
      trim: true,
    },
    referral_earnings: {
      type: Number,
      default: 0,
      max: 10000, // 10K ETB limit
    },
    total_referrals: {
      type: Number,
      default: 0,
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

// Generate referral code if not exists
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Pre-save hooks
UserSchema.pre('save', function (next) {
  // Validate that at least email or phone is provided
  if (!this.email && !this.phone) {
    const error = new Error('Either email or phone number must be provided');
    return next(error);
  }

  // Generate referral code for new users
  if (this.isNew && !this.referral_code) {
    this.referral_code = generateReferralCode();
  }

  // Update tier and discount rate based on total submissions
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

// Indexes for better performance
UserSchema.index({ referral_code: 1 }, { unique: true, sparse: true });
UserSchema.index({ referred_by: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
