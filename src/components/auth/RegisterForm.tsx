'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  locale: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ locale }) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'individual';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    business_name: '', // For agents only
    terms_accepted: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('auth.required_field');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.invalid_email');
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = t('auth.required_field');
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.required_field');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = t('auth.required_field');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('auth.required_field');
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t('auth.required_field');
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Business name validation for agents
    if (userType === 'agent' && !formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required for agents';
    }

    // Terms validation
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role: userType === 'agent' ? 'agent' : 'user'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || 'Registration failed' });
        return;
      }

      // Store token and redirect based on user role
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));

      if (userType === 'agent') {
        router.push(createLocalizedPath('/agent/dashboard'));
      } else {
        router.push(createLocalizedPath('/dashboard'));
      }

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {userType === 'agent' ? 'Register as Agent' : t('auth.register')}
        </h2>
        <p className="mt-2 text-gray-600">
          {userType === 'agent' 
            ? 'Join our network of business partners'
            : 'Create your Etho-DV account'
          }
        </p>
      </div>

      {/* User Type Indicator */}
      <div className={cn(
        'p-4 rounded-lg border',
        userType === 'agent' 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-green-50 border-green-200'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">
              {userType === 'agent' ? '🏢 Business Account' : '👤 Individual Account'}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {userType === 'agent' 
                ? 'Bulk submissions with discounted rates'
                : 'Single form submissions at $1 USD each'
              }
            </p>
          </div>
          <Link 
            href={createLocalizedPath(`/register${userType === 'agent' ? '' : '?type=agent'}`)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Switch
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <span className="text-red-400 mr-2">⚠️</span>
              <span className="text-sm text-red-800">{errors.general}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            error={errors.first_name}
            required
            placeholder="Enter your first name"
            autoComplete="given-name"
          />

          <Input
            label="Last Name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            error={errors.last_name}
            required
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
        </div>

        {userType === 'agent' && (
          <Input
            label="Business Name"
            type="text"
            value={formData.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            error={errors.business_name}
            required
            placeholder="Enter your business/shop name"
            autoComplete="organization"
          />
        )}

        <Input
          label={t('auth.email')}
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="your.email@example.com"
          autoComplete="email"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          required
          placeholder="+251 912 345 678"
          autoComplete="tel"
        />

        <Input
          label={t('auth.password')}
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          required
          placeholder="Enter your password (min 8 characters)"
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.terms_accepted}
              onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-600">
              I agree to the{' '}
              <Link 
                href={createLocalizedPath('/terms')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link 
                href={createLocalizedPath('/privacy')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms_accepted && (
            <p className="text-sm text-red-600">{errors.terms_accepted}</p>
          )}
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {userType === 'agent' ? 'Create Agent Account' : t('auth.register_button')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Social Registration */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {/* Implement Google OAuth */}}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t('auth.already_have_account')}{' '}
          <Link
            href={createLocalizedPath('/login')}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>

      {/* Agent Benefits (for individual users) */}
      {userType !== 'agent' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            🏢 Are you a business?
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Register as an agent for bulk submissions, better rates, and business tools!
          </p>
          <Link href={createLocalizedPath('/register?type=agent')}>
            <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
              Switch to Agent Registration
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;