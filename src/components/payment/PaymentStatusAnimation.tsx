'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { PaymentValidationResponse } from '@/types/payment';
import { cn } from '@/lib/utils';

interface PaymentStatusAnimationProps {
  status: 'loading' | 'success' | 'failed' | 'pending';
  validationResponse?: PaymentValidationResponse;
  onRetry?: () => void;
  onContinue?: () => void;
  transactionId?: string;
}

const PaymentStatusAnimation: React.FC<PaymentStatusAnimationProps> = ({
  status,
  validationResponse,
  onRetry,
  onContinue,
  transactionId
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay content appearance for better UX
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [status]);

  const LoadingAnimation = () => (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-transparent rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full animate-pulse flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Verifying Your Payment
        </h3>
        <p className="text-gray-600 max-w-md">
          Please wait while we verify your transaction with the payment provider. This may take a few moments.
        </p>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  const SuccessAnimation = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Success checkmark animation */}
      <div className="relative">
        <div className={cn(
          "w-24 h-24 bg-green-100 rounded-full flex items-center justify-center transition-all duration-500",
          showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
          <div className={cn(
            "w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 delay-200",
            showContent ? "scale-100" : "scale-0"
          )}>
            <svg 
              className={cn(
                "w-8 h-8 text-white transition-all duration-300 delay-400",
                showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
        
        {/* Success particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 bg-green-400 rounded-full animate-ping",
                showContent ? "opacity-60" : "opacity-0"
              )}
              style={{
                top: `${20 + Math.sin(i * 60) * 30}%`,
                left: `${50 + Math.cos(i * 60) * 40}%`,
                animationDelay: `${i * 100 + 500}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className={cn(
        "text-center transition-all duration-500 delay-300",
        showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <h3 className="text-2xl font-bold text-green-700 mb-2">
          Payment Verified! 🎉
        </h3>
        <p className="text-gray-600 max-w-md mb-4">
          Your payment has been successfully verified. Your DV lottery application is now being processed.
        </p>
        
        {transactionId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              <span className="font-medium">Transaction ID:</span> {transactionId}
            </p>
          </div>
        )}
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ Payment confirmed</p>
          <p>✅ Application submitted</p>
          <p>📧 Confirmation email sent</p>
        </div>
      </div>
    </div>
  );

  const FailedAnimation = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Failed X animation */}
      <div className="relative">
        <div className={cn(
          "w-24 h-24 bg-red-100 rounded-full flex items-center justify-center transition-all duration-500",
          showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
          <div className={cn(
            "w-16 h-16 bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 delay-200",
            showContent ? "scale-100" : "scale-0"
          )}>
            <svg 
              className={cn(
                "w-8 h-8 text-white transition-all duration-300 delay-400",
                showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        
        {/* Shake animation */}
        <div className={cn(
          "absolute inset-0 transition-all duration-300",
          showContent ? "animate-pulse" : ""
        )} />
      </div>
      
      <div className={cn(
        "text-center transition-all duration-500 delay-300",
        showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <h3 className="text-2xl font-bold text-red-700 mb-2">
          Payment Verification Failed
        </h3>
        <p className="text-gray-600 max-w-md mb-4">
          We couldn't verify your payment with the provided information. Please check your details and try again.
        </p>
        
        {validationResponse?.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <span className="font-medium">Error:</span> {validationResponse.message}
            </p>
          </div>
        )}
        
        {validationResponse?.verification_details && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Verification Details:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Amount Match: {validationResponse.verification_details.amount_matches ? '✅' : '❌'}</p>
              <p>Reference Valid: {validationResponse.verification_details.reference_valid ? '✅' : '❌'}</p>
              <p>Timing Valid: {validationResponse.verification_details.timing_valid ? '✅' : '❌'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const PendingAnimation = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Pending clock animation */}
      <div className="relative">
        <div className={cn(
          "w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center transition-all duration-500",
          showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
          <div className={cn(
            "w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 delay-200",
            showContent ? "scale-100" : "scale-0"
          )}>
            <svg 
              className={cn(
                "w-8 h-8 text-white transition-all duration-300 delay-400 animate-pulse",
                showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "text-center transition-all duration-500 delay-300",
        showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <h3 className="text-2xl font-bold text-yellow-700 mb-2">
          Payment Under Review
        </h3>
        <p className="text-gray-600 max-w-md mb-4">
          Your payment information has been submitted and is being reviewed by our team. 
          This process typically takes 2-4 hours for bank transfers.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            You will receive an email notification once your payment is verified.
          </p>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>📤 Payment information submitted</p>
          <p>🔍 Manual verification in progress</p>
          <p>📧 Email notification pending</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingAnimation />;
      case 'success':
        return <SuccessAnimation />;
      case 'failed':
        return <FailedAnimation />;
      case 'pending':
        return <PendingAnimation />;
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (status === 'success' && onContinue) {
      return (
        <div className="flex justify-center mt-8">
          <Button onClick={onContinue} size="lg" className="px-8">
            Continue to Dashboard
          </Button>
        </div>
      );
    }

    if (status === 'failed' && onRetry) {
      return (
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="outline" onClick={onRetry} size="lg">
            Try Again
          </Button>
          <Button href="mailto:support@etho-dv.com" size="lg">
            Contact Support
          </Button>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className="flex justify-center mt-8">
          <Button href="/" variant="outline" size="lg">
            Return to Home
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[400px] flex flex-col justify-center items-center p-8">
      {renderContent()}
      {renderActions()}
    </div>
  );
};

export default PaymentStatusAnimation;