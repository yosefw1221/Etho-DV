'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { DVFormData } from '@/types/form';

interface ContactInfoStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  data,
  updateData,
  errors
}) => {
  const t = useTranslations();
  const [helpModal, setHelpModal] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    updateData({
      contact_info: {
        ...data.contact_info,
        [field]: value
      }
    });
  };

  const getHelpContent = (field: string) => {
    const helpTexts: Record<string, string> = {
      passport_number: t('help.passport_number'),
      phone: 'Enter your phone number with country code (e.g., +251912345678)',
      address: 'Enter your complete current mailing address including street, city, and postal code',
    };
    return helpTexts[field] || '';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('form.contact_info')}
        </h3>
        <p className="text-sm text-gray-600">
          Provide your current contact information exactly as it appears on your documents.
        </p>
      </div>

      <Input
        label={t('form.address')}
        value={data.contact_info.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        error={errors.address}
        required
        placeholder="Street address, City, State/Region, Postal Code, Country"
        showHelpIcon
        onHelpClick={() => setHelpModal('address')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t('form.phone')}
          type="tel"
          value={data.contact_info.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          required
          placeholder="+251912345678"
          showHelpIcon
          onHelpClick={() => setHelpModal('phone')}
        />

        <Input
          label="Email Address"
          type="email"
          value={data.contact_info.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="your.email@example.com"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Passport Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('form.passport_number')}
            value={data.contact_info.passport_number}
            onChange={(e) => handleInputChange('passport_number', e.target.value.toUpperCase())}
            error={errors.passport_number}
            required
            placeholder="ET1234567"
            showHelpIcon
            onHelpClick={() => setHelpModal('passport_number')}
          />

          <Input
            label={t('form.passport_expiry')}
            type="date"
            value={data.contact_info.passport_expiry}
            onChange={(e) => handleInputChange('passport_expiry', e.target.value)}
            error={errors.passport_expiry}
            required
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
          />
        </div>
      </div>

      {/* Help Modals */}
      <Modal
        isOpen={helpModal === 'passport_number'}
        onClose={() => setHelpModal(null)}
        title="Passport Number Help"
      >
        <p className="text-gray-600">{getHelpContent('passport_number')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Important:</strong> Enter your passport number exactly as it appears on your passport, including any letters and numbers.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={helpModal === 'phone'}
        onClose={() => setHelpModal(null)}
        title="Phone Number Help"
      >
        <p className="text-gray-600">{getHelpContent('phone')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Examples:</strong>
            <br />• Ethiopia: +251912345678
            <br />• USA: +15551234567
            <br />• Include country code for international access
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={helpModal === 'address'}
        onClose={() => setHelpModal(null)}
        title="Address Help"
      >
        <p className="text-gray-600">{getHelpContent('address')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Example:</strong>
            <br />123 Bole Road, Addis Ababa, AA 1000, Ethiopia
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ContactInfoStep;