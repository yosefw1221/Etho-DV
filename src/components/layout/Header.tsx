'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { locales } from '@/i18n/request';

const localeConfig = {
  locales,
  localeLabels: {
    en: 'English',
    am: 'አማርኛ',
    ti: 'ትግርኛ',
    or: 'Oromifa'
  },
  localeFlags: {
    en: '🇺🇸',
    am: '🇪🇹',
    ti: '🇪🇹', 
    or: '🇪🇹'
  }
};

interface HeaderProps {
  locale: string;
}

const Header: React.FC<HeaderProps> = ({ locale }) => {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const createLocalizedPath = (path: string, newLocale: string) => {
    const basePath = path.replace(/^\/[a-z]{2}/, '');
    return newLocale === 'en' ? basePath || '/' : `/${newLocale}${basePath || ''}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href={locale === 'en' ? '/' : `/${locale}`}
              className="text-2xl font-bold text-primary-600"
            >
              Etho-DV
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={locale === 'en' ? '/' : `/${locale}`}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.home')}
            </Link>
            <Link 
              href={createLocalizedPath('/apply', locale)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.apply')}
            </Link>
          </nav>

          {/* Language Selector & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <span>{localeConfig.localeFlags[locale as keyof typeof localeConfig.localeFlags]}</span>
                <span>{localeConfig.localeLabels[locale as keyof typeof localeConfig.localeLabels]}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {localeConfig.locales.map((loc) => (
                      <Link
                        key={loc}
                        href={createLocalizedPath('/', loc)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsLanguageMenuOpen(false)}
                      >
                        <span className="mr-3">{localeConfig.localeFlags[loc as keyof typeof localeConfig.localeFlags]}</span>
                        {localeConfig.localeLabels[loc as keyof typeof localeConfig.localeLabels]}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <Link href={createLocalizedPath('/login', locale)}>
              <Button variant="outline" size="sm">
                {t('navigation.login')}
              </Button>
            </Link>
            <Link href={createLocalizedPath('/register', locale)}>
              <Button size="sm">
                {t('navigation.register')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                href={locale === 'en' ? '/' : `/${locale}`}
                className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.home')}
              </Link>
              <Link 
                href={createLocalizedPath('/apply', locale)}
                className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.apply')}
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 mb-2">{t('languages.title')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {localeConfig.locales.map((loc) => (
                    <Link
                      key={loc}
                      href={createLocalizedPath('/', loc)}
                      className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-2">{localeConfig.localeFlags[loc as keyof typeof localeConfig.localeFlags]}</span>
                      {localeConfig.localeLabels[loc as keyof typeof localeConfig.localeLabels]}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="px-3 py-2 space-y-2">
                <Link 
                  href={createLocalizedPath('/login', locale)}
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link 
                  href={createLocalizedPath('/register', locale)}
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full">
                    {t('navigation.register')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;