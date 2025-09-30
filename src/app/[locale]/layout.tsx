import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });
const locales = ['en', 'am', 'ti', 'or'];

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const titles = {
    en: 'Etho-DV | DV Lottery Application Service',
    am: 'ኢቶ-ዲቪ | የዲቪ ሎተሪ ማመልከቻ አገልግሎት',
    ti: 'ኢቶ-ዲቪ | የዲቪ ሎተሪ ምዝገባ አገልግሎት',
    or: 'Etho-DV | Tajaajila iyyaduu visa'
  } as const;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: 'Professional DV lottery application service for Ethiopian users.',
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}