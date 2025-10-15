'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { DVFormData, FamilyMember, COUNTRIES } from '@/types/form';
import { generateId, calculateAge } from '@/lib/utils';

interface FamilyInfoStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
}

const FamilyInfoStep: React.FC<FamilyInfoStepProps> = ({
  data,
  updateData,
  errors
}) => {
  const t = useTranslations();
  const [helpModal, setHelpModal] = useState<string | null>(null);

  const isMarried = data.background_info.marital_status === 'Married';
  const hasSpouse = data.family_members.some(member => member.relationship_type === 'spouse');
  const children = data.family_members.filter(member => member.relationship_type === 'child');
  const numberOfChildren = data.number_of_children || 0;

  const addSpouse = () => {
    const spouse: FamilyMember = {
      id: generateId(),
      relationship_type: 'spouse',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      place_of_birth: '',
      gender: '',
      country_of_birth: '',
      passport_number: '',
      passport_expiry: '',
    };

    updateData({
      family_members: [...data.family_members, spouse]
    });
  };

  const addChild = () => {
    const child: FamilyMember = {
      id: generateId(),
      relationship_type: 'child',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      place_of_birth: '',
      gender: '',
      country_of_birth: '',
      passport_number: '',
      passport_expiry: '',
    };

    updateData({
      family_members: [...data.family_members, child]
    });
  };

  const removeFamilyMember = (id: string) => {
    updateData({
      family_members: data.family_members.filter(member => member.id !== id)
    });
  };

  const handleNumberOfChildrenChange = (value: string) => {
    const num = parseInt(value) || 0;
    const clampedNum = Math.max(0, Math.min(10, num)); // Limit to 0-10 children

    updateData({ number_of_children: clampedNum });

    // Get current children
    const currentChildren = data.family_members.filter(m => m.relationship_type === 'child');
    const spouseMembers = data.family_members.filter(m => m.relationship_type === 'spouse');

    if (clampedNum > currentChildren.length) {
      // Add more children
      const newChildren: FamilyMember[] = [];
      for (let i = currentChildren.length; i < clampedNum; i++) {
        newChildren.push({
          id: generateId(),
          relationship_type: 'child',
          first_name: '',
          middle_name: '',
          last_name: '',
          date_of_birth: '',
          place_of_birth: '',
          gender: '',
          country_of_birth: '',
          passport_number: '',
          passport_expiry: '',
        });
      }
      updateData({
        family_members: [...spouseMembers, ...currentChildren, ...newChildren]
      });
    } else if (clampedNum < currentChildren.length) {
      // Remove excess children
      const childrenToKeep = currentChildren.slice(0, clampedNum);
      updateData({
        family_members: [...spouseMembers, ...childrenToKeep]
      });
    }
  };

  const updateFamilyMember = (id: string, field: string, value: string | File) => {
    updateData({
      family_members: data.family_members.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    });
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFamilyMember(id, 'photo', file);
    }
  };

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: t('form.male') },
    { value: 'Female', label: t('form.female') },
  ];

  const renderFamilyMember = (member: FamilyMember, index: number) => {
    const isSpouse = member.relationship_type === 'spouse';
    const memberErrors = Object.keys(errors).reduce((acc, key) => {
      if (key.startsWith(`family_${member.id}_`)) {
        const fieldName = key.replace(`family_${member.id}_`, '');
        acc[fieldName] = errors[key];
      }
      return acc;
    }, {} as Record<string, string>);

    return (
      <div key={member.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            {isSpouse ? 'Spouse Information' : `Child ${index + 1} Information`}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFamilyMember(member.id)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.first_name')}
              value={member.first_name}
              onChange={(e) => updateFamilyMember(member.id, 'first_name', e.target.value)}
              error={memberErrors.first_name}
              required
            />

            <Input
              label={t('form.middle_name')}
              value={member.middle_name || ''}
              onChange={(e) => updateFamilyMember(member.id, 'middle_name', e.target.value)}
            />
          </div>

          <Input
            label={t('form.last_name')}
            value={member.last_name}
            onChange={(e) => updateFamilyMember(member.id, 'last_name', e.target.value)}
            error={memberErrors.last_name}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.date_of_birth')}
              type="date"
              value={member.date_of_birth}
              onChange={(e) => updateFamilyMember(member.id, 'date_of_birth', e.target.value)}
              error={memberErrors.date_of_birth}
              required
              helpText={
                member.relationship_type === 'child' && member.date_of_birth
                  ? `Age: ${calculateAge(new Date(member.date_of_birth))} years`
                  : undefined
              }
            />

            <Select
              label={t('form.gender')}
              value={member.gender}
              onChange={(e) => updateFamilyMember(member.id, 'gender', e.target.value)}
              options={genderOptions}
              error={memberErrors.gender}
              required
            />
          </div>

          <Input
            label={t('form.place_of_birth')}
            value={member.place_of_birth}
            onChange={(e) => updateFamilyMember(member.id, 'place_of_birth', e.target.value)}
            error={memberErrors.place_of_birth}
            required
            placeholder="City, Country"
          />

          <Select
            label="Country of Birth"
            value={member.country_of_birth}
            onChange={(e) => updateFamilyMember(member.id, 'country_of_birth', e.target.value)}
            options={COUNTRIES}
            error={memberErrors.country_of_birth}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.passport_number')}
              value={member.passport_number || ''}
              onChange={(e) => updateFamilyMember(member.id, 'passport_number', e.target.value.toUpperCase())}
              error={memberErrors.passport_number}
              placeholder="Optional if child"
            />

            <Input
              label={t('form.passport_expiry')}
              type="date"
              value={member.passport_expiry || ''}
              onChange={(e) => updateFamilyMember(member.id, 'passport_expiry', e.target.value)}
              error={memberErrors.passport_expiry}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isSpouse ? 'Spouse Photo' : `Child ${index + 1} Photo`} *
            </label>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => handleFileChange(member.id, e)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors min-h-[44px]"
            />
            
            {memberErrors.photo && (
              <p className="form-error">{memberErrors.photo}</p>
            )}
            
            {member.photo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✓ Photo uploaded: {member.photo.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('form.family_info')}
        </h3>
        <p className="text-sm text-gray-600">
          Include information for your spouse (if married) and all unmarried children under 21.
        </p>
      </div>

      {/* Spouse Section */}
      {isMarried && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">Spouse Information</h4>
            {!hasSpouse && (
              <Button onClick={addSpouse} size="sm">
                Add Spouse
              </Button>
            )}
          </div>

          {hasSpouse && (
            <div className="space-y-4">
              {data.family_members
                .filter(member => member.relationship_type === 'spouse')
                .map(member => renderFamilyMember(member, 0))}
            </div>
          )}

          {!hasSpouse && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                Since you are married, you must include your spouse's information.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Children Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Children Information (Unmarried, Under 21)
          </h4>

          <Input
            label="Number of Children (Unmarried, Under 21)"
            type="number"
            min="0"
            max="10"
            value={numberOfChildren.toString()}
            onChange={(e) => handleNumberOfChildrenChange(e.target.value)}
            placeholder="0"
            helpText="Enter the number of unmarried children under 21 years old"
          />
        </div>

        {numberOfChildren > 0 ? (
          <div className="space-y-4 mt-4">
            {children.map((child, index) => renderFamilyMember(child, index))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-600">
              No children specified. Enter the number of unmarried children under 21 above if applicable.
            </p>
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h5 className="font-medium text-blue-900 mb-2">Important Notes:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All unmarried children under 21 must be included</li>
            <li>• Each family member needs their own photo</li>
            <li>• Passport information is optional for children</li>
            <li>• Children who are 21 or older should not be included</li>
          </ul>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={helpModal === 'family'}
        onClose={() => setHelpModal(null)}
        title="Family Information Help"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You must include information for all qualifying family members.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h6 className="font-medium text-yellow-900 mb-2">Who to Include:</h6>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Your spouse (if married)</li>
              <li>• All unmarried children under 21 years old</li>
              <li>• Even if they will not immigrate with you</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h6 className="font-medium text-red-900 mb-2">Do NOT Include:</h6>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Children who are 21 or older</li>
              <li>• Married children of any age</li>
              <li>• Parents or other relatives</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyInfoStep;