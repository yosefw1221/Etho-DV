'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModernLoginForm from '@/components/auth/ModernLoginForm';

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
    success: 'Login successful!',
    or_continue_with: 'Or continue with',
    google_login: 'Continue with Google',
    telegram_login: 'Continue with Telegram'
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
    success: 'በተሳካ ሁኔታ ገብተዋል!',
    or_continue_with: 'ወይም ቀጥል በ',
    google_login: 'በGoogle ቀጥል',
    telegram_login: 'በTelegram ቀጥል'
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
    success: 'ብዓወት ኣቲኻ!',
    or_continue_with: 'ወይ ቀጽል ብ',
    google_login: 'ብGoogle ቀጽል',
    telegram_login: 'ብTelegram ቀጽል'
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
    back_home: 'Gara Jalqaba Deebi\'i',
    required: 'Barbaachisaa',
    invalid_email: 'Imeelii sirrii galchi',
    processing: 'Seenaa jira...',
    success: 'Milkaa\'inaan seente!',
    or_continue_with: 'Ykn itti fufi',
    google_login: 'Google waliin itti fufi',
    telegram_login: 'Telegram waliin itti fufi'
  }
};

export default function LoginPage({ params }: LoginPageProps) {
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Back to Home Link */}
      <div className="absolute top-6 left-6">
        <Link 
          href={`/${locale}`} 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md">
        <ModernLoginForm locale={locale} />
      </div>
    </div>
  );
}