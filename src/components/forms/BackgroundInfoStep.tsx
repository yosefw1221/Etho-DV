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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({
        background_info: {
          ...data.background_info,
          photo: file
        }
      });
    }
  };

  const getHelpContent = (field: string) => {
    const helpTexts: Record<string, string> = {
      education: t('help.education_help'),
      photo: t('help.photo_requirements'),
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
        showHelpIcon
        onHelpClick={() => setHelpModal('occupation')}
      />

      <Select
        label={t('form.marital_status')}
        value={data.background_info.marital_status}
        onChange={(e) => handleInputChange('marital_status', e.target.value)}
        options={maritalStatusOptions}
        error={errors.marital_status}
        required
      />

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('form.upload_photo')}
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Applicant Photo *
              <button
                type="button"
                onClick={() => setHelpModal('photo')}
                className="ml-2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 inline-flex items-center justify-center text-gray-600 text-sm transition-colors"
                aria-label="Help"
              >
                ?
              </button>
            </label>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors min-h-[44px]"
            />
            
            {errors.photo && (
              <p className="form-error">{errors.photo}</p>
            )}
            
            {data.background_info.photo && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✓ Photo uploaded: {data.background_info.photo.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="font-medium text-blue-900 mb-2">Photo Requirements:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Recent photo (within 6 months)</li>
              <li>• White or off-white background</li>
              <li>• Square format (600x600px minimum)</li>
              <li>• Face clearly visible, looking directly at camera</li>
              <li>• JPEG or PNG format, max 2MB</li>
            </ul>
          </div>
        </div>
      </div>

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
        isOpen={helpModal === 'photo'}
        onClose={() => setHelpModal(null)}
        title="Photo Requirements"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">{getHelpContent('photo')}</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h6 className="font-medium text-yellow-900 mb-2">Important Notes:</h6>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Photo must be taken within the last 6 months</li>
              <li>• Must show your full face, front view, with eyes open</li>
              <li>• Neutral facial expression or natural smile</li>
              <li>• No glasses, hats, or head coverings (except religious)</li>
              <li>• Professional quality photo required</li>
            </ul>
          </div>
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