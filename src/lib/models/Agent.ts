import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAgent extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLicense?: string;
  
  // Agent tier system
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  commissionRate: number; // Percentage
  
  // Statistics
  totalApplications: number;
  totalEarnings: number;
  currentMonthApplications: number;
  currentMonthEarnings: number;
  
  // Performance metrics
  successRate: number; // Percentage of successful applications
  averageProcessingTime: number; // In days
  clientSatisfactionRating: number; // Out of 5
  
  // Agent status
  isVerified: boolean;
  isActive: boolean;
  verificationDate?: Date;
  
  // Pricing structure
  individualPrice: number; // Price per individual application in ETB
  familyPrice: number; // Price per family application in ETB
  bulkDiscountThreshold: number; // Number of applications for bulk discount
  bulkDiscountRate: number; // Percentage discount for bulk
  
  // Banking information (for payouts)
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: 100
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true,
    maxlength: 200
  },
  businessPhone: {
    type: String,
    required: [true, 'Business phone is required'],
    trim: true
  },
  businessEmail: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid business email']
  },
  businessLicense: {
    type: String,
    trim: true
  },
  
  // Agent tier system
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
    default: function() {
      switch (this.tier) {
        case 'bronze': return 10;
        case 'silver': return 15;
        case 'gold': return 20;
        case 'platinum': return 25;
        default: return 10;
      }
    }
  },
  
  // Statistics
  totalApplications: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  currentMonthApplications: {
    type: Number,
    default: 0,
    min: 0
  },
  currentMonthEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Performance metrics
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageProcessingTime: {
    type: Number,
    default: 0,
    min: 0
  },
  clientSatisfactionRating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  
  // Agent status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationDate: {
    type: Date
  },
  
  // Pricing structure (in ETB)
  individualPrice: {
    type: Number,
    required: true,
    default: 75, // 75 ETB (~$1.50 USD)
    min: 50
  },
  familyPrice: {
    type: Number,
    required: true,
    default: 125, // 125 ETB (~$2.50 USD)
    min: 75
  },
  bulkDiscountThreshold: {
    type: Number,
    default: 10, // 10 applications
    min: 5
  },
  bulkDiscountRate: {
    type: Number,
    default: 15, // 15% discount
    min: 5,
    max: 30
  },
  
  // Banking information
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  accountHolderName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Update tier based on performance
agentSchema.methods.updateTier = function() {
  const applications = this.totalApplications;
  const earnings = this.totalEarnings;
  const successRate = this.successRate;
  
  if (applications >= 100 && earnings >= 10000 && successRate >= 95) {
    this.tier = 'platinum';
    this.commissionRate = 25;
  } else if (applications >= 50 && earnings >= 5000 && successRate >= 90) {
    this.tier = 'gold';
    this.commissionRate = 20;
  } else if (applications >= 20 && earnings >= 2000 && successRate >= 85) {
    this.tier = 'silver';
    this.commissionRate = 15;
  } else {
    this.tier = 'bronze';
    this.commissionRate = 10;
  }
};

// Calculate pricing with discounts
agentSchema.methods.calculatePrice = function(applicationCount: number, applicationType: 'individual' | 'family' = 'individual') {
  const basePrice = applicationType === 'family' ? this.familyPrice : this.individualPrice;
  let totalPrice = basePrice * applicationCount;
  
  // Apply bulk discount if applicable
  if (applicationCount >= this.bulkDiscountThreshold) {
    const discount = (this.bulkDiscountRate / 100) * totalPrice;
    totalPrice = totalPrice - discount;
  }
  
  // Apply tier-based discount
  const tierDiscount = (this.commissionRate / 100) * totalPrice;
  totalPrice = totalPrice - tierDiscount;
  
  return Math.round(totalPrice);
};

// Reset monthly statistics (should be called monthly via cron job)
agentSchema.methods.resetMonthlyStats = function() {
  this.currentMonthApplications = 0;
  this.currentMonthEarnings = 0;
};

// Update statistics when new application is processed
agentSchema.methods.updateStats = function(earnings: number, isSuccessful: boolean = true) {
  this.totalApplications += 1;
  this.currentMonthApplications += 1;
  
  if (isSuccessful) {
    this.totalEarnings += earnings;
    this.currentMonthEarnings += earnings;
  }
  
  // Recalculate success rate (simplified)
  // In a real implementation, you'd track successful vs total applications
  if (isSuccessful) {
    this.successRate = Math.min(100, this.successRate + 0.5);
  } else {
    this.successRate = Math.max(0, this.successRate - 2);
  }
  
  // Update tier based on new stats
  this.updateTier();
};

// Indexes for performance
agentSchema.index({ userId: 1 });
agentSchema.index({ tier: 1 });
agentSchema.index({ isVerified: 1, isActive: 1 });
agentSchema.index({ totalApplications: -1 });
agentSchema.index({ totalEarnings: -1 });

const Agent = (mongoose.models.Agent as Model<IAgent>) || 
  mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;