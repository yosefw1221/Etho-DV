'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface TeleBirrPaymentProps {
  amount: number;
  currency: string;
  onPaymentComplete: (data: {
    payment_method: string;
    reference_number: string;
    phone_number: string;
  }) => void;
  onCancel: () => void;
}

const TeleBirrPayment: React.FC<TeleBirrPaymentProps> = ({
  amount,
  currency,
  onPaymentComplete,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'payment' | 'confirmation'>('phone');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhoneNumber = (phone: string): boolean => {
    // Ethiopian phone number validation (TeleBirr format)
    const phoneRegex = /^(\+251|251|0)?[97]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handlePhoneSubmit = async () => {
    setErrors({});
    
    if (!phoneNumber.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phone: 'Please enter a valid Ethiopian mobile number (e.g., +251912345678)' });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate TeleBirr API call for payment initiation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call TeleBirr API
      // const response = await initiateTeleBirrPayment({
      //   phone_number: phoneNumber,
      //   amount: amount,
      //   currency: currency
      // });

      setStep('payment');
    } catch (error) {
      setErrors({ phone: 'Failed to initiate payment. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmation = () => {
    setErrors({});
    
    if (!referenceNumber.trim()) {
      setErrors({ reference: 'Transaction reference number is required' });
      return;
    }

    if (referenceNumber.length < 8) {
      setErrors({ reference: 'Please enter a valid transaction reference number' });
      return;
    }

    onPaymentComplete({
      payment_method: 'telebirr',
      reference_number: referenceNumber,
      phone_number: phoneNumber
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+251${cleaned.substring(1)}`;
    }
    if (cleaned.length === 9) {
      return `+251${cleaned}`;
    }
    return phone;
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📱</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          TeleBirr Payment
        </h3>
        <p className="text-gray-600">
          Enter your TeleBirr mobile number to proceed with payment
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 font-medium">Payment Amount:</span>
          <span className="text-blue-900 font-bold text-lg">
            {currency === 'USD' ? '$' : 'ETB '}{amount} {currency}
          </span>
        </div>
      </div>

      <Input
        label="TeleBirr Mobile Number"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
        placeholder="+251912345678"
        error={errors.phone}
        required
        infoContent="Enter your TeleBirr registered mobile number. This number will receive the payment prompt."
        infoTitle="TeleBirr Number"
      />

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePhoneSubmit}
          loading={isProcessing}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Initiating...' : 'Continue'}
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Check Your Phone
        </h3>
        <p className="text-gray-600">
          A payment request has been sent to <strong>{phoneNumber}</strong>
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h4 className="font-semibold text-orange-900 mb-3">📱 Complete Payment on Your Phone</h4>
        <ol className="text-sm text-orange-800 space-y-2">
          <li>1. Check your TeleBirr app for the payment notification</li>
          <li>2. Verify the amount: <strong>{currency === 'USD' ? '$' : 'ETB '}{amount} {currency}</strong></li>
          <li>3. Enter your TeleBirr PIN to confirm payment</li>
          <li>4. Copy the transaction reference number from the confirmation</li>
          <li>5. Enter the reference number below</li>
        </ol>
      </div>

      <Input
        label="Transaction Reference Number"
        type="text"
        value={referenceNumber}
        onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
        placeholder="Enter TeleBirr transaction reference"
        error={errors.reference}
        required
        infoContent="After completing payment on your TeleBirr app, enter the transaction reference number you received."
        infoTitle="Reference Number"
      />

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep('phone')}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handlePaymentConfirmation}
          className="flex-1"
        >
          Confirm Payment
        </Button>
      </div>

      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            {['phone', 'payment', 'confirmation'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === stepName
                    ? 'bg-primary-600 text-white'
                    : index < ['phone', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={cn(
                    'w-16 h-1 mx-2',
                    index < ['phone', 'payment', 'confirmation'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'phone' && renderPhoneStep()}
        {step === 'payment' && renderPaymentStep()}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💡 TeleBirr Payment Help</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Make sure you have sufficient balance in your TeleBirr wallet</li>
          <li>• Keep your phone nearby to receive the payment notification</li>
          <li>• The payment prompt will appear automatically in your TeleBirr app</li>
          <li>• Transaction fees may apply according to TeleBirr terms</li>
        </ul>
      </div>
    </div>
  );
};

export default TeleBirrPayment;