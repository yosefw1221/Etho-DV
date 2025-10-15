import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  referrer_id: mongoose.Types.ObjectId;
  referred_user_id: mongoose.Types.ObjectId;
  form_id: mongoose.Types.ObjectId;
  reward_amount: number;
  reward_status: 'pending' | 'paid' | 'cancelled';
  reward_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const ReferralSchema: Schema = new Schema({
  referrer_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  form_id: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  reward_amount: {
    type: Number,
    default: 50, // 50 ETB
    required: true
  },
  reward_status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  reward_date: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance
ReferralSchema.index({ referrer_id: 1, created_at: -1 });
ReferralSchema.index({ referred_user_id: 1 });
ReferralSchema.index({ form_id: 1 });
ReferralSchema.index({ reward_status: 1 });

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
