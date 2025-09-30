'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  locale: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ locale }) => {
  const t = useTranslations();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('auth.required_field');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.invalid_email');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('auth.required_field');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || 'Login failed' });
        return;
      }

      // Store token and redirect based on user role
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));

      if (result.user.role === 'agent') {
        router.push(createLocalizedPath('/agent/dashboard'));
      } else {
        router.push(createLocalizedPath('/dashboard'));
      }

    } catch (error) {
      console.error('Login error:', error);
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
          {t('auth.login')}
        </h2>
        <p className="mt-2 text-gray-600">
          Welcome back to Etho-DV
        </p>
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
          label={t('auth.password')}
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-600">Remember me</span>
          </label>
          
          <Link 
            href={createLocalizedPath('/forgot-password')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {t('auth.login_button')}
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

      {/* Social Login Options */}
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

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t('auth.dont_have_account')}{' '}
          <Link
            href={createLocalizedPath('/register')}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            {t('auth.register')}
          </Link>
        </p>
      </div>

      {/* Agent Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          📊 For Business Partners
        </h4>
        <p className="text-sm text-blue-800 mb-3">
          Are you a stationary shop or business? Register as an agent for bulk submissions and better rates!
        </p>
        <Link href={createLocalizedPath('/register?type=agent')}>
          <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
            Register as Agent
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;