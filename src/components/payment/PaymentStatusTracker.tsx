'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PaymentStatus {
  id: string;
  status: 'pending' | 'verifying' | 'completed' | 'failed';
  amount: number;
  currency: string;
  payment_method: string;
  reference_number?: string;
  transaction_id?: string;
  created_at: string;
  verified_at?: string;
  verification_notes?: string;
  estimated_verification_time?: string;
}

interface PaymentStatusTrackerProps {
  payment: PaymentStatus;
  onRetryPayment?: () => void;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  payment,
  onRetryPayment
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          title: 'Payment Submitted',
          description: 'Your payment is being processed and verified'
        };
      case 'verifying':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🔍',
          title: 'Under Verification',
          description: 'Our team is verifying your payment details'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          title: 'Payment Verified',
          description: 'Payment confirmed and application submitted'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          title: 'Payment Failed',
          description: 'Payment could not be verified. Please try again'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓',
          title: 'Unknown Status',
          description: 'Payment status is unclear'
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'telebirr':
        return 'TeleBirr';
      case 'cbe':
        return 'Commercial Bank of Ethiopia';
      case 'abyssinia':
        return 'Abyssinia Bank';
      default:
        return method;
    }
  };

  const getEstimatedTime = () => {
    if (payment.status === 'completed') return null;
    
    if (payment.payment_method === 'telebirr') {
      return 'Usually verified within 30 minutes';
    }
    
    if (['cbe', 'abyssinia'].includes(payment.payment_method)) {
      return 'Usually verified within 2-4 hours during business days';
    }
    
    return payment.estimated_verification_time || 'Verification time varies';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className={cn('px-6 py-4 border-b', statusConfig.color)}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">{statusConfig.icon}</span>
            <div>
              <h3 className="text-lg font-semibold">{statusConfig.title}</h3>
              <p className="text-sm opacity-90">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {payment.currency === 'USD' ? '$' : 'ETB '}{payment.amount} {payment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{getPaymentMethodName(payment.payment_method)}</span>
                </div>
                {payment.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-xs">{payment.reference_number}</span>
                  </div>
                )}
                {payment.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{payment.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">{formatDate(payment.created_at)}</span>
                </div>
                {payment.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium">{formatDate(payment.verified_at)}</span>
                  </div>
                )}
                {payment.status !== 'completed' && getEstimatedTime() && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="text-blue-600 text-xs">{getEstimatedTime()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Notes */}
          {payment.verification_notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h5 className="font-medium text-gray-900 mb-1">Verification Notes</h5>
              <p className="text-sm text-gray-700">{payment.verification_notes}</p>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            {[
              { key: 'submitted', label: 'Submitted', icon: '📤' },
              { key: 'verifying', label: 'Verifying', icon: '🔍' },
              { key: 'completed', label: 'Completed', icon: '✅' }
            ].map((step, index) => {
              const isActive = index <= getProgressIndex(payment.status);
              const isCurrent = getCurrentStep(payment.status) === step.key;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2',
                    isActive
                      ? isCurrent
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  )}>
                    <span className="text-xs">{step.icon}</span>
                  </div>
                  {index < 2 && (
                    <div className={cn(
                      'flex-1 h-1 mx-4',
                      isActive ? 'bg-green-500' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Submitted</span>
            <span className="text-xs text-gray-600">Verifying</span>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>

        {/* Actions */}
        {(payment.status === 'failed' || payment.status === 'pending') && (
          <div className="px-6 py-4 border-t">
            <div className="flex space-x-4">
              {payment.status === 'failed' && onRetryPayment && (
                <button
                  onClick={onRetryPayment}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Retry Payment
                </button>
              )}
              
              <a
                href={`mailto:support@etho-dv.com?subject=Payment Issue - ${payment.id}`}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 What happens next?</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {payment.status === 'pending' && (
            <>
              <p>• Our team will verify your payment within the estimated time</p>
              <p>• You'll receive an email confirmation once verified</p>
              <p>• Your DV application will be automatically submitted</p>
            </>
          )}
          {payment.status === 'verifying' && (
            <>
              <p>• Payment verification is in progress</p>
              <p>• Please do not make duplicate payments</p>
              <p>• You'll be notified once verification is complete</p>
            </>
          )}
          {payment.status === 'completed' && (
            <>
              <p>• Your payment has been successfully verified</p>
              <p>• Your DV application has been submitted</p>
              <p>• Check your dashboard for application status</p>
            </>
          )}
          {payment.status === 'failed' && (
            <>
              <p>• Payment verification failed - please try again</p>
              <p>• Check your payment details and try another method</p>
              <p>• Contact support if you continue having issues</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function getProgressIndex(status: string): number {
  switch (status) {
    case 'pending':
    case 'verifying':
      return 1;
    case 'completed':
      return 2;
    default:
      return 0;
  }
}

function getCurrentStep(status: string): string {
  switch (status) {
    case 'pending':
      return 'submitted';
    case 'verifying':
      return 'verifying';
    case 'completed':
      return 'completed';
    default:
      return 'submitted';
  }
}

export default PaymentStatusTracker;