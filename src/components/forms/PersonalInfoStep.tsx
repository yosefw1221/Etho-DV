'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import EthiopianDateInput from '@/components/ui/EthiopianDateInput';
import { DVFormData, COUNTRIES } from '@/types/form';
import { validatePersonalInfo, validateField } from '@/lib/validation';
import { calculateAge } from '@/lib/utils';

interface PersonalInfoStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  updateData,
  errors
}) => {
  const t = useTranslations();
  const [helpModal, setHelpModal] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    updateData({
      personal_info: {
        ...data.personal_info,
        [field]: value
      }
    });
  };

  const handleFieldBlur = (field: string, value: string) => {
    // Real-time validation on field blur
    const validationError = validateField(field, value);
    if (validationError) {
      // Show inline validation error
      const currentErrors = { ...errors };
      currentErrors[field] = validationError.message;
      // Note: We don't set errors here as it's managed by parent component
      console.log(`Validation error for ${field}:`, validationError.message);
    }
  };

  const getHelpContent = (field: string) => {
    const helpTexts: Record<string, string> = {
// passport_number: t('help.passport_number'),
      date_of_birth: t('help.date_format'),
      place_of_birth: t('help.place_of_birth'),
    };
    return helpTexts[field] || '';
  };

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: t('form.male') },
    { value: 'Female', label: t('form.female') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t('form.first_name')}
          value={data.personal_info.first_name}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          onBlur={(e) => handleFieldBlur('first_name', e.target.value)}
          error={errors.first_name}
          required
          placeholder="Enter your first name"
        />

        <Input
          label={t('form.middle_name')}
          value={data.personal_info.middle_name || ''}
          onChange={(e) => handleInputChange('middle_name', e.target.value)}
          onBlur={(e) => handleFieldBlur('middle_name', e.target.value)}
          error={errors.middle_name}
          placeholder="Enter your middle name (optional)"
        />
      </div>

      <Input
        label={t('form.last_name')}
        value={data.personal_info.last_name}
        onChange={(e) => handleInputChange('last_name', e.target.value)}
        onBlur={(e) => handleFieldBlur('last_name', e.target.value)}
        error={errors.last_name}
        required
        placeholder="Enter your last name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EthiopianDateInput
          label={t('form.date_of_birth')}
          value={data.personal_info.date_of_birth}
          onChange={(value) => handleInputChange('date_of_birth', value)}
          error={errors.date_of_birth}
          required
          helpText={
            data.personal_info.date_of_birth ? (
              (() => {
                const age = calculateAge(new Date(data.personal_info.date_of_birth));
                return age >= 18 
                  ? `Age: ${age} years ✓` 
                  : `Age: ${age} years - Must be 18+ to apply`;
              })()
            ) : "You can use either Gregorian or Ethiopian calendar"
          }
        />

        <Select
          label={t('form.gender')}
          value={data.personal_info.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          options={genderOptions}
          error={errors.gender}
          required
        />
      </div>

      <Input
        label={t('form.place_of_birth')}
        value={data.personal_info.place_of_birth}
        onChange={(e) => handleInputChange('place_of_birth', e.target.value)}
        onBlur={(e) => handleFieldBlur('place_of_birth', e.target.value)}
        error={errors.place_of_birth}
        required
        placeholder="Enter city and country (e.g., Addis Ababa, Ethiopia)"
        infoContent="Enter the city and country where you were born"
        infoTitle="Place of Birth Help"
      />

      <Select
        label="Country of Birth"
        value={data.personal_info.country_of_birth}
        onChange={(e) => handleInputChange('country_of_birth', e.target.value)}
        options={COUNTRIES}
        error={errors.country_of_birth}
        required
      />

      <Select
        label="Country of Eligibility (if different)"
        value={data.personal_info.country_of_eligibility || ''}
        onChange={(e) => handleInputChange('country_of_eligibility', e.target.value)}
        options={COUNTRIES}
        placeholder="Select if different from country of birth"
      />

      {/* Help Modals */}
      <Modal
        isOpen={helpModal === 'date_of_birth'}
        onClose={() => setHelpModal(null)}
        title="Date of Birth Help"
      >
        <p className="text-gray-600">{getHelpContent('date_of_birth')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> You must be at least 18 years old to apply for the DV lottery.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={helpModal === 'place_of_birth'}
        onClose={() => setHelpModal(null)}
        title="Place of Birth Help"
      >
        <p className="text-gray-600">{getHelpContent('place_of_birth')}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Examples:</strong>
            <br />• Addis Ababa, Ethiopia
            <br />• Asmara, Eritrea
            <br />• Mekelle, Ethiopia
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalInfoStep;