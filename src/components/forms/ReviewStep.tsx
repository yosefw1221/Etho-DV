'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { DVFormData } from '@/types/form';
import { formatDate } from '@/lib/utils';

interface ReviewStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  updateData,
  errors,
  onSubmit,
  isSubmitting
}) => {
  const t = useTranslations();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!agreed) {
      alert('Please confirm that all information is accurate before submitting.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    await onSubmit();
  };

  const goToStep = (step: number) => {
    updateData({ current_step: step });
  };

  const familyMembers = data.family_members || [];
  const spouse = familyMembers.find(member => member.relationship_type === 'spouse');
  const children = familyMembers.filter(member => member.relationship_type === 'child');

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('form.review')}
        </h3>
        <p className="text-sm text-gray-600">
          Please review all information carefully before submitting your DV lottery application.
        </p>
        
        {/* Application Summary */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Application Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Primary Applicant:</span>
              <p className="text-blue-700">1 person</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Family Members:</span>
              <p className="text-blue-700">{familyMembers.length} person{familyMembers.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Total Photos:</span>
              <p className="text-blue-700">
                {[data.background_info.photo, ...familyMembers.map(m => m.photo)].filter(Boolean).length} uploaded
              </p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Marital Status:</span>
              <p className="text-blue-700">{data.background_info.marital_status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            {t('form.personal_info')}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(1)}
          >
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Full Name:</span>
            <p className="text-gray-700">
              {data.personal_info.first_name} {data.personal_info.middle_name} {data.personal_info.last_name}
            </p>
          </div>
          <div>
            <span className="font-medium">Date of Birth:</span>
            <p className="text-gray-700">
              {data.personal_info.date_of_birth ? formatDate(new Date(data.personal_info.date_of_birth)) : ''}
            </p>
          </div>
          <div>
            <span className="font-medium">Place of Birth:</span>
            <p className="text-gray-700">{data.personal_info.place_of_birth}</p>
          </div>
          <div>
            <span className="font-medium">Gender:</span>
            <p className="text-gray-700">{data.personal_info.gender}</p>
          </div>
          <div>
            <span className="font-medium">Country of Birth:</span>
            <p className="text-gray-700">{data.personal_info.country_of_birth}</p>
          </div>
          {data.personal_info.country_of_eligibility && (
            <div>
              <span className="font-medium">Country of Eligibility:</span>
              <p className="text-gray-700">{data.personal_info.country_of_eligibility}</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Applicant Photo */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Primary Applicant Photo
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(4)}
          >
            Edit
          </Button>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Photo Status:</span>
          <p className="text-gray-700">
            {data.background_info.photo ? 
              `✓ ${typeof data.background_info.photo === 'object' && 'name' in data.background_info.photo 
                ? data.background_info.photo.name 
                : 'Uploaded'}` 
              : 'Not uploaded'}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            {t('form.contact_info')}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(2)}
          >
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="md:col-span-2">
            <span className="font-medium">Address:</span>
            <p className="text-gray-700">{data.contact_info.address}</p>
          </div>
          <div>
            <span className="font-medium">Phone:</span>
            <p className="text-gray-700">{data.contact_info.phone}</p>
          </div>
          <div>
            <span className="font-medium">Email:</span>
            <p className="text-gray-700">{data.contact_info.email}</p>
          </div>
          <div>
            <span className="font-medium">Passport Number:</span>
            <p className="text-gray-700">{data.contact_info.passport_number}</p>
          </div>
          <div>
            <span className="font-medium">Passport Expiry:</span>
            <p className="text-gray-700">
              {data.contact_info.passport_expiry ? formatDate(new Date(data.contact_info.passport_expiry)) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Background Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Background Information
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(3)}
          >
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Education Level:</span>
            <p className="text-gray-700">{data.background_info.education_level}</p>
          </div>
          <div>
            <span className="font-medium">Occupation:</span>
            <p className="text-gray-700">{data.background_info.occupation || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium">Marital Status:</span>
            <p className="text-gray-700">{data.background_info.marital_status}</p>
          </div>
        </div>
      </div>

      {/* Family Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            {t('form.family_info')}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(5)}
          >
            Edit
          </Button>
        </div>

        {spouse && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-800 mb-2">Spouse:</h5>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {spouse.first_name} {spouse.middle_name} {spouse.last_name}</p>
              <p><span className="font-medium">Date of Birth:</span> {spouse.date_of_birth ? formatDate(new Date(spouse.date_of_birth)) : ''}</p>
              <p><span className="font-medium">Place of Birth:</span> {spouse.place_of_birth}</p>
              <p><span className="font-medium">Gender:</span> {spouse.gender}</p>
              <p><span className="font-medium">Country of Birth:</span> {spouse.country_of_birth}</p>
              {spouse.passport_number && (
                <p><span className="font-medium">Passport Number:</span> {spouse.passport_number}</p>
              )}
              {spouse.passport_expiry && (
                <p><span className="font-medium">Passport Expiry:</span> {formatDate(new Date(spouse.passport_expiry))}</p>
              )}
              <p><span className="font-medium">Photo:</span> {spouse.photo ? `✓ ${spouse.photo.name || 'Uploaded'}` : 'Not uploaded'}</p>
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Children ({children.length}):</h5>
            <div className="space-y-3">
              {children.map((child, index) => (
                <div key={child.id} className="text-sm">
                  <p className="font-medium">Child {index + 1}:</p>
                  <div className="ml-4 space-y-1">
                    <p><span className="font-medium">Name:</span> {child.first_name} {child.middle_name} {child.last_name}</p>
                    <p><span className="font-medium">Date of Birth:</span> {child.date_of_birth ? formatDate(new Date(child.date_of_birth)) : ''}</p>
                    <p><span className="font-medium">Place of Birth:</span> {child.place_of_birth}</p>
                    <p><span className="font-medium">Gender:</span> {child.gender}</p>
                    <p><span className="font-medium">Country of Birth:</span> {child.country_of_birth}</p>
                    {child.passport_number && (
                      <p><span className="font-medium">Passport Number:</span> {child.passport_number}</p>
                    )}
                    {child.passport_expiry && (
                      <p><span className="font-medium">Passport Expiry:</span> {formatDate(new Date(child.passport_expiry))}</p>
                    )}
                    <p><span className="font-medium">Photo:</span> {child.photo ? `✓ ${child.photo.name || 'Uploaded'}` : 'Not uploaded'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!spouse && children.length === 0 && (
          <p className="text-sm text-gray-600">No family members added.</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-medium text-yellow-900 mb-4">
          Important Declaration
        </h4>
        
        <div className="space-y-3 text-sm text-yellow-800">
          <p>By submitting this application, I declare that:</p>
          <ul className="space-y-2 ml-4">
            <li>• All information provided is true and accurate to the best of my knowledge</li>
            <li>• I understand that providing false information may result in disqualification</li>
            <li>• I meet the education or work experience requirements for the DV program</li>
            <li>• I am from an eligible country for the DV lottery program</li>
            <li>• I will submit only one entry for this DV program year</li>
          </ul>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-yellow-800">
              I confirm that all information is accurate and I understand the requirements
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!agreed || isSubmitting}
          loading={isSubmitting}
          size="lg"
          className="px-12"
        >
          {t('form.submit')} Application
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Submission"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to submit your DV lottery application? 
            Once submitted, you cannot make changes.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">
              <strong>Important:</strong> Please ensure all information is correct before proceeding.
              Incorrect information may result in disqualification.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              loading={isSubmitting}
              className="flex-1"
            >
              Yes, Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewStep;