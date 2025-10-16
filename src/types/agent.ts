export interface AgentStats {
  total_submissions: number;
  completed_submissions: number;
  pending_submissions: number;
  failed_submissions: number;
  total_revenue: number;
  commission_earned: number; // 20 ETB per completed form
  current_tier: 'bronze' | 'silver' | 'gold';
  discount_rate: number;
  this_month_submissions: number;
  avg_processing_time: number; // in hours
}

export interface AgentTier {
  name: 'bronze' | 'silver' | 'gold';
  min_submissions: number;
  rate_per_form: number; // in ETB
  benefits: string[];
  next_tier?: {
    name: string;
    required_submissions: number;
    forms_needed: number;
  };
}

export interface BulkSubmission {
  id: string;
  upload_date: Date;
  filename: string;
  total_forms: number;
  processed_forms: number;
  failed_forms: number;
  status: 'uploading' | 'validating' | 'processing' | 'completed' | 'failed';
  validation_errors?: ValidationError[];
  estimated_cost: number;
  actual_cost?: number;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface FormSubmissionSummary {
  id: string;
  applicant_name: string;
  submission_date: Date;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'failed';
  payment_status: 'pending' | 'paid' | 'failed';
  cost: number;
  reference_number?: string;
}

export const AGENT_TIERS: AgentTier[] = [
  {
    name: 'bronze',
    min_submissions: 0,
    rate_per_form: 300, // ETB (agents pay 300 ETB, get 20 ETB commission back)
    benefits: [
      'Basic support',
      'Standard processing time',
      '300 ETB per form',
      '20 ETB commission per completed form'
    ]
  },
  {
    name: 'silver',
    min_submissions: 11,
    rate_per_form: 300, // ETB
    benefits: [
      'Priority support',
      'Faster processing',
      '300 ETB per form',
      '20 ETB commission per completed form',
      'Bulk upload tools'
    ],
    next_tier: {
      name: 'Gold',
      required_submissions: 50,
      forms_needed: 39 // 50 - 11
    }
  },
  {
    name: 'gold',
    min_submissions: 50,
    rate_per_form: 300, // ETB
    benefits: [
      'VIP support',
      'Fastest processing',
      '300 ETB per form',
      '20 ETB commission per completed form',
      'Advanced analytics',
      'Custom solutions'
    ]
  }
];

export const getAgentTier = (totalSubmissions: number): AgentTier => {
  if (totalSubmissions >= 50) return AGENT_TIERS[2]; // gold
  if (totalSubmissions >= 11) return AGENT_TIERS[1]; // silver
  return AGENT_TIERS[0]; // bronze
};

export const calculateBulkCost = (formCount: number, currentTier: AgentTier): number => {
  return formCount * currentTier.rate_per_form;
};

export const getNextTierProgress = (totalSubmissions: number): {
  current: AgentTier;
  next?: AgentTier;
  progress: number;
  formsNeeded: number;
} => {
  const current = getAgentTier(totalSubmissions);
  
  if (current.name === 'gold') {
    return {
      current,
      progress: 100,
      formsNeeded: 0
    };
  }
  
  const next = current.name === 'bronze' ? AGENT_TIERS[1] : AGENT_TIERS[2];
  const formsNeeded = next.min_submissions - totalSubmissions;
  const progress = (totalSubmissions / next.min_submissions) * 100;
  
  return {
    current,
    next,
    progress: Math.min(progress, 100),
    formsNeeded: Math.max(formsNeeded, 0)
  };
};