'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Login to Your Account',
    subtitle: 'Access your DV lottery applications and dashboard',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    forgot_password: 'Forgot Password?',
    no_account: "Don't have an account?",
    register: 'Register here',
    back_home: 'Back to Home',
    required: 'Required',
    invalid_email: 'Please enter a valid email',
    processing: 'Logging in...',
    success: 'Login successful!'
  },
  am: {
    title: 'መለያዎ ወደ ውስጥ ይግቡ',
    subtitle: 'የዲቪ ሎተሪ ማመልከቻዎቻችሁን እና ዳሽቦርድ ይድረሱ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    login: 'ግባ',
    forgot_password: 'የይለፍ ቃል ረሳሽ?',
    no_account: 'መለያ የሎትም?',
    register: 'እዚህ ይመዝገቡ',
    back_home: 'ወደ መነሻ ይመለሱ',
    required: 'ያስፈልጋል',
    invalid_email: 'ትክክለኛ ኢሜይል ያስገቡ',
    processing: 'እየገባ ነው...',
    success: 'በተሳካ ሁኔታ ገብተዋል!'
  },
  ti: {
    title: 'ናብ መለያኻ ኣቲወ',
    subtitle: 'ናይ ዲቪ ሎተሪ ምዝገባታትካ እና ዳሽቦርድ ተበጻሕ',
    email: 'ኢመይል',
    password: 'ናይ መሓላለፊ ቃል',
    login: 'ኣቲወ',
    forgot_password: 'ናይ መሓላለፊ ቃል ረሲዕካ?',
    no_account: 'መለያ የብልካን?',
    register: 'ኣብዚ ተመዝገብ',
    back_home: 'ናብ መበገሲ ተመለስ',
    required: 'የድሊ',
    invalid_email: 'ቅኑዕ ኢመይል ኣእቱ',
    processing: 'እትኣቶ...',
    success: 'ብዓወት ኣቲኻ!'
  },
  or: {
    title: 'Gara Herregaa Keessaniitti Seeni',
    subtitle: 'Iyyadoota DV lottery keessanii fi dashboard argadhu',
    email: 'Imeelii',
    password: 'Jecha Icciitii',
    login: 'Seeni',
    forgot_password: 'Jecha icciitii irraanfatte?',
    no_account: 'Herregaan hin qabdu?',
    register: 'Asii galmeeffadhu',
    back_home: 'Gara Jalqaba Deebiʼi',
    required: 'Barbaachisaa',
    invalid_email: 'Imeelii sirrii galchi',
    processing: 'Seenaa jira...',
    success: 'Milkaaʼinaan seente!'
  }
};

export default function LoginPage({ params }: LoginPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  const t = content[locale as keyof typeof content] || content.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) newErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalid_email;
    }

    if (!formData.password) newErrors.password = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Login data:', formData);
      alert(t.success);
      
      // In real app, redirect to dashboard
      // router.push(`/${locale}/dashboard`);
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {t.back_home}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.password} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link href={`/${locale}/forgot-password`} className="text-sm text-blue-600 hover:text-blue-700">
                {t.forgot_password}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-medium transition-colors text-lg min-h-[44px]"
            >
              {isSubmitting ? t.processing : t.login}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                {t.no_account}{' '}
                <Link href={`/${locale}/register`} className="text-blue-600 hover:text-blue-700 font-medium">
                  {t.register}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}