import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'am', 'ti', 'or'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../locales/${locale}/common.json`)).default,
  };
});

export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const localeSegment = segments[1];

  if (locales.includes(localeSegment)) {
    return localeSegment;
  }

  return 'en'; // default locale
}

export function createLocalizedPath(path: string, locale: string): string {
  // Remove existing locale prefix if any
  const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, '/');

  // Add new locale prefix
  if (locale === 'en') {
    return cleanPath === '/' ? '/' : cleanPath;
  }

  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export const localeConfig = {
  locales,
  defaultLocale: 'en',
  localeLabels: {
    en: 'English',
    am: 'አማርኛ',
    ti: 'ትግርኛ',
    or: 'Oromifa',
  },
  localeFlags: {
    en: '🇺🇸',
    am: '🇪🇹',
    ti: '🇪🇹',
    or: '🇪🇹',
  },
};
