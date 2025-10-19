import { getRequestConfig, GetRequestConfigParams } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'am', 'ti', 'or'];

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as string)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../locales/${locale}/common.json`)).default,
  };
});
