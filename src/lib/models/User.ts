import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'agent' | 'admin';
  languagePreference: 'en' | 'am' | 'ti' | 'or';
  isActive: boolean;
  emailVerified: boolean;
  profilePhoto?: string;
  // OAuth fields
  provider?: 'local' | 'google' | 'telegram';
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        // Password only required for local auth
        return !this.provider || this.provider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user',
    },
    languagePreference: {
      type: String,
      enum: ['en', 'am', 'ti', 'or'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'telegram'],
      default: 'local',
    },
    providerId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Indexes for performance
// Note: email index is automatically created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>('User', userSchema);

export { User };
export default User;
