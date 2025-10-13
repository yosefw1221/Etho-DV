'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModernLoginForm from '@/components/auth/ModernLoginForm';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
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