'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import PersonalInfoStep from './PersonalInfoStep';
import ContactInfoStep from './ContactInfoStep';
import BackgroundInfoStep from './BackgroundInfoStep';
import PhotoUploadStep from './PhotoUploadStep';
import FamilyInfoStep from './FamilyInfoStep';
import ReviewStep from './ReviewStep';
import { DVFormData, FormStep, ValidationError } from '@/types/form';
import {
  validatePersonalInfo,
  validateContactInfo,
  validateBackgroundInfo,
  validateFamilyInfo,
  validateCompleteForm
} from '@/lib/validation';

interface DVApplicationFormProps {
  locale: string;
  initialData?: Partial<DVFormData>;
}

const DVApplicationForm: React.FC<DVApplicationFormProps> = ({
  locale,
  initialData
}) => {
  const t = useTranslations();

  const [formData, setFormData] = useState<DVFormData>({
    personal_info: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      place_of_birth: '',
      gender: '',
      country_of_birth: '',
      country_of_eligibility: '',
    },
    contact_info: {
      address: '',
      phone: '',
      email: '',
      passport_number: '',
      passport_expiry: '',
    },
    background_info: {
      education_level: '',
      occupation: '',
      marital_status: '',
    },
    family_members: [],
    number_of_children: 0,
    current_step: 1,
    is_complete: false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('dv_form_draft');
    if (savedData && !initialData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }, [initialData]);

  useEffect(() => {
    localStorage.setItem('dv_form_draft', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<DVFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Note: Removed automatic error clearing to prevent interference with validation
    // Errors will be cleared manually when validation passes or when moving to next step
  };

  const clearErrors = () => {
    setErrors({});
  };

  const validateCurrentStep = (): boolean => {
    let validation;

    switch (formData.current_step) {
      case 1:
        validation = validatePersonalInfo(formData);
        break;
      case 2:
        validation = validateContactInfo(formData);
        break;
      case 3:
        validation = validateBackgroundInfo(formData);
        break;
      case 4:
        // Photo validation - check if photo exists
        const photo = formData.background_info.photo;
        if (!photo) {
          setErrors({ photo: 'Photo is required for the primary applicant' });
          return false;
        }
        // If photo is PhotoData type, check for url
        if (typeof photo === 'object' && 'url' in photo && !photo.url) {
          setErrors({ photo: 'Photo upload failed. Please try again.' });
          return false;
        }
        // If photo is File type, check if it's a valid file
        if (photo instanceof File && photo.size === 0) {
          setErrors({ photo: 'Photo file is empty. Please select a valid photo.' });
          return false;
        }
        // Additional photo validation
        if (photo instanceof File) {
          if (photo.size > 240000) { // 240KB limit
            setErrors({ photo: 'Photo size must be less than 240KB' });
            return false;
          }
          if (!photo.type.match(/^image\/(jpeg|jpg)$/)) {
            setErrors({ photo: 'Photo must be in JPEG format' });
            return false;
          }
        }
        setErrors({});
        return true;
      case 5:
        validation = validateFamilyInfo(formData);
        break;
      case 6:
        validation = validateCompleteForm(formData);
        break;
      default:
        return true;
    }

    // validation should never be falsy, but handle edge case
    if (!validation) {
      console.error('Validation function returned null/undefined');
      return false; // Fail safe - don't allow navigation if validation is broken
    }

    const errorMap = validation.errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);

    setErrors(errorMap);
    return validation.isValid;
  };

  const nextStep = () => {
    // Force validation of current step
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      // Show alert for better user feedback
      alert('Please fix all validation errors before proceeding to the next step.');
      
      // Scroll to first error if validation fails
      setTimeout(() => {
        const firstError = document.querySelector('.form-error, [data-error="true"], .text-red-600');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return; // Prevent navigation
    }
    
    if (formData.current_step < 6) {
      // Clear errors before moving to next step
      clearErrors();
      updateFormData({ current_step: formData.current_step + 1 });
    }
  };

  const prevStep = () => {
    if (formData.current_step > 1) {
      updateFormData({ current_step: formData.current_step - 1 });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicant_data: {
            first_name: formData.personal_info.first_name,
            middle_name: formData.personal_info.middle_name,
            last_name: formData.personal_info.last_name,
            date_of_birth: formData.personal_info.date_of_birth,
            place_of_birth: formData.personal_info.place_of_birth,
            gender: formData.personal_info.gender,
            country_of_birth: formData.personal_info.country_of_birth,
            address: formData.contact_info.address,
            phone: formData.contact_info.phone,
            email: formData.contact_info.email,
            passport_number: formData.contact_info.passport_number,
            passport_expiry: formData.contact_info.passport_expiry,
            education_level: formData.background_info.education_level,
            occupation: formData.background_info.occupation,
            marital_status: formData.background_info.marital_status
          },
          family_members: formData.family_members.map(member => ({
            relationship_type: member.relationship_type,
            first_name: member.first_name,
            middle_name: member.middle_name,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth,
            place_of_birth: member.place_of_birth,
            gender: member.gender,
            country_of_birth: member.country_of_birth,
            passport_number: member.passport_number || '',
            passport_expiry: member.passport_expiry || ''
          })),
          // Primary photo from background_info.photo
          primary_photo: formData.background_info.photo
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Form submission failed');
      }

      // Clear draft on successful submission
      localStorage.removeItem('dv_form_draft');
      
      // Redirect to payment page
      const paymentPath = locale === 'en' 
        ? `/payment/${result.form_id}` 
        : `/${locale}/payment/${result.form_id}`;
      window.location.href = paymentPath;

    } catch (error) {
      console.error('Form submission failed:', error);
      setErrors({ submission: error instanceof Error ? error.message : 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: number): string => {
    const titles = {
      1: t('form.personal_info'),
      2: t('form.contact_info'),
      3: 'Background Information',
      4: t('form.upload_photo') || 'Upload Photo',
      5: t('form.family_info'),
      6: t('form.review')
    };
    return titles[step as keyof typeof titles] || '';
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: formData,
      updateData: updateFormData,
      errors
    };

    switch (formData.current_step) {
      case 1:
        return <PersonalInfoStep {...commonProps} />;
      case 2:
        return <ContactInfoStep {...commonProps} />;
      case 3:
        return <BackgroundInfoStep {...commonProps} />;
      case 4:
        return <PhotoUploadStep {...commonProps} />;
      case 5:
        return <FamilyInfoStep {...commonProps} />;
      case 6:
        return <ReviewStep {...commonProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar
          current={formData.current_step}
          total={6}
          className="mb-4"
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {getStepTitle(formData.current_step)}
          </h2>
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              Step {formData.current_step} has {Object.keys(errors).length} validation error{Object.keys(errors).length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <div>
          {formData.current_step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              {t('form.previous')}
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Validation Status */}
          {Object.keys(errors).length > 0 ? (
            <span className="text-sm text-red-600 flex items-center">
              ⚠️ Please fix errors to continue
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              Draft saved automatically
            </span>
          )}

          {formData.current_step < 6 ? (
            <Button 
              onClick={nextStep} 
              disabled={isSubmitting}
              className={Object.keys(errors).length > 0 ? 'opacity-75' : ''}
            >
              {t('form.next')}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-medium text-red-900 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="text-sm text-red-800 space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>Need help?</strong> Click the (?) icons next to form fields for detailed guidance.
          Your progress is automatically saved as you complete each section.
        </p>
      </div>
    </div>
  );
};

export default DVApplicationForm;