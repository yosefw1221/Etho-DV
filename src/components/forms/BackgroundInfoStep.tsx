'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { DVFormData, EDUCATION_LEVELS } from '@/types/form';

interface BackgroundInfoStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
}

const BackgroundInfoStep: React.FC<BackgroundInfoStepProps> = ({
  data,
  updateData,
  errors
}) => {
  const t = useTranslations();
  const [helpModal, setHelpModal] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    updateData({
      background_info: {
        ...data.background_info,
        [field]: value
      }
    });
  };

  const getHelpContent = (field: string) => {
    const helpTexts: Record<string, string> = {
      education: t('help.education_help'),
      occupation: 'Enter your current job title or profession. If unemployed, enter "Unemployed"',
    };
    return helpTexts[field] || '';
  };

  const maritalStatusOptions = [
    { value: '', label: 'Select Marital Status' },
    { value: 'Single', label: t('form.single') },
    { value: 'Married', label: t('form.married') },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Background Information
        </h3>
        <p className="text-sm text-gray-600">
          Provide information about your education, work, and family status.
        </p>
      </div>

      <Select
        label={t('form.education')}
        value={data.background_info.education_level}
        onChange={(e) => handleInputChange('education_level', e.target.value)}
        options={EDUCATION_LEVELS}
        error={errors.education_level}
        required
        showHelpIcon
        onHelpClick={() => setHelpModal('education')}
      />

      <Input
        label="Occupation"
        value={data.background_info.occupation || ''}
        onChange={(e) => handleInputChange('occupation', e.target.value)}
        placeholder="Enter your current occupation"
        infoContent="Enter your current job title or profession"
        infoTitle="Occupation Help"
      />

      <Select
        label={t('form.marital_status')}
        value={data.background_info.marital_status}
        onChange={(e) => handleInputChange('marital_status', e.target.value)}
        options={maritalStatusOptions}
        error={errors.marital_status}
        required
      />

      {/* Help Modals */}
      <Modal
        isOpen={helpModal === 'education'}
        onClose={() => setHelpModal(null)}
        title="Education Level Help"
      >
        <p className="text-gray-600">{getHelpContent('education')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>DV Requirement:</strong> You must have at least a high school education (12 years of formal education) OR qualifying work experience.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={helpModal === 'occupation'}
        onClose={() => setHelpModal(null)}
        title="Occupation Help"
      >
        <p className="text-gray-600">{getHelpContent('occupation')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Examples:</strong>
            <br />• Teacher
            <br />• Engineer
            <br />• Student
            <br />• Unemployed
            <br />• Business Owner
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BackgroundInfoStep;