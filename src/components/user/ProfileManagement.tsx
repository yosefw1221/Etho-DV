'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  language_preference: string;
  role: string;
  business_name?: string;
}

interface ProfileManagementProps {
  user: User;
  onUserUpdate: (user: User) => void;
  locale: string;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ user, onUserUpdate, locale }) => {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    language_preference: user.language_preference,
    business_name: user.business_name || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'አማርኛ (Amharic)' },
    { value: 'ti', label: 'ትግርኛ (Tigrinya)' },
    { value: 'or', label: 'Afaan Oromoo (Oromo)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (user.role === 'agent' && !formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required for agents';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 4) {
      newErrors.new_password = 'Password must be at least 4 characters long';
    }

    if (!passwordData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || 'Update failed' });
        return;
      }

      onUserUpdate(result.user);
      
      // Show success message
      setErrors({ general: '' });
      
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setIsPasswordLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();

      if (!response.ok) {
        setPasswordErrors({ general: result.error || 'Password change failed' });
        return;
      }

      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsChangingPassword(false);
      setPasswordErrors({});
      
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              👤 Personal Information
            </h2>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span className="text-sm text-red-800">{errors.general}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="First Name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                error={errors.first_name}
                required
              />

              <Input
                label="Last Name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                error={errors.last_name}
                required
              />
            </div>

            <div className="mb-6">
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                required
                placeholder="+251 912 345 678"
              />
            </div>

            {user.role === 'agent' && (
              <div className="mb-6">
                <Input
                  label="Business Name"
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  error={errors.business_name}
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <Select
                label="Preferred Language"
                value={formData.language_preference}
                onChange={(e) => handleInputChange('language_preference', e.target.value)}
                options={languageOptions}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <span className="absolute right-3 top-2 text-gray-400">🔒</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏷️ Account Type
            </h3>
            <div className={cn(
              'p-4 rounded-lg border',
              user.role === 'agent' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            )}>
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {user.role === 'agent' ? '🏢' : '👤'}
                </span>
                <div>
                  <p className="font-medium">
                    {user.role === 'agent' ? 'Agent Account' : 'Individual Account'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'agent' 
                      ? 'Business partner with bulk submission access'
                      : 'Personal account for individual applications'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔐 Security
            </h3>
            
            {!isChangingPassword ? (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="w-full"
                size="sm"
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <span className="text-sm text-red-800">{passwordErrors.general}</span>
                  </div>
                )}

                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => handlePasswordInputChange('current_password', e.target.value)}
                  error={passwordErrors.current_password}
                  required
                  size="sm"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => handlePasswordInputChange('new_password', e.target.value)}
                  error={passwordErrors.new_password}
                  required
                  size="sm"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => handlePasswordInputChange('confirm_password', e.target.value)}
                  error={passwordErrors.confirm_password}
                  required
                  size="sm"
                />

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    loading={isPasswordLoading}
                    disabled={isPasswordLoading}
                    size="sm"
                    className="flex-1"
                  >
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                      setPasswordErrors({});
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚙️ Account Actions
            </h3>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                📧 Request Data Export
              </Button>
              <Button variant="outline" size="sm" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                🗑️ Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;