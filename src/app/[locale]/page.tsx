'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ShareIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    // Hero Section
    hero_title: 'Your Path to the',
    hero_highlight: 'American Dream',
    hero_subtitle: 'Complete your DV Lottery application in minutes. Professional, secure, and affordable.',
    hero_price: '450 ETB',
    hero_cta: 'Start Application',
    hero_secondary: 'Learn More',

    // Referral Program
    referral_badge: 'Earn Money',
    referral_title: 'Refer Friends, Earn 50 ETB',
    referral_subtitle: 'Share your unique referral link and earn 50 ETB for every successful application',
    referral_cta: 'Get Your Referral Link',

    // How Referral Works
    referral_how_title: 'How Referral Works',
    referral_step1_title: '1. Sign Up',
    referral_step1_desc: 'Create your free account and get your unique referral link',
    referral_step2_title: '2. Share Link',
    referral_step2_desc: 'Share your link with friends and family via social media or messaging',
    referral_step3_title: '3. Earn 50 ETB',
    referral_step3_desc: 'When they complete their application and payment, you earn 50 ETB',
    referral_step4_title: '4. Get Paid',
    referral_step4_desc: 'Receive your earnings via Telebirr, Abyssinia Bank, or CBE',

    // Payment Methods
    payment_title: 'Easy & Secure Payment',
    payment_subtitle: 'Available payment methods for all transactions',

    // How It Works
    works_title: 'How It Works',
    works_step1: 'Fill out the simple form',
    works_step2: 'Upload your photo',
    works_step3: 'Review and submit',
    works_step4: 'Pay 450 ETB securely',
    works_step5: 'Get confirmation instantly',

    // Features
    features_title: 'Why Choose Etho-DV',
    feature1_title: 'Professional Service',
    feature1_desc: 'Expert guidance throughout your application process',
    feature2_title: 'Secure & Private',
    feature2_desc: 'Bank-level encryption protects your personal data',
    feature3_title: 'Fast Processing',
    feature3_desc: 'Complete your application in under 10 minutes',
    feature4_title: '24/7 Support',
    feature4_desc: 'Get help anytime from our support team',


    // CTA
    cta_title: 'Ready to Apply?',
    cta_subtitle: 'Join thousands of successful applicants today',
    cta_button: 'Start Your Application',

    // Footer
    footer_copyright: '© 2024 Etho-DV. All rights reserved.',
    footer_terms: 'Terms',
    footer_privacy: 'Privacy',
    footer_contact: 'Contact',
  },
  am: {
    // Hero Section
    hero_title: 'የአሜሪካ ህልምዎ',
    hero_highlight: 'መንገድ',
    hero_subtitle: 'የዲቪ ሎተሪ ማመልከቻዎን በደቂቃዎች ውስጥ ያጠናቅቁ። ፕሮፌሽናል፣ ደህንነቱ የተጠበቀ እና ተመጣጣኝ።',
    hero_price: '450 ብር',
    hero_cta: 'ማመልከቻ ጀምር',
    hero_secondary: 'ተጨማሪ ይወቁ',

    // Referral Program
    referral_badge: 'ገንዘብ ያግኙ',
    referral_title: 'ጓደኞችን ያጋሩ፣ 50 ብር ያግኙ',
    referral_subtitle: 'የእርስዎን ልዩ የሪፈራል አገናኝ ያጋሩ እና ለእያንዳንዱ ስኬታማ ማመልከቻ 50 ብር ያግኙ',
    referral_cta: 'የሪፈራል አገናኝ ያግኙ',

    // How Referral Works
    referral_how_title: 'ሪፈራል እንዴት ይሰራል',
    referral_step1_title: '1. ይመዝገቡ',
    referral_step1_desc: 'ነጻ መለያዎን ይፍጠሩ እና ልዩ የሪፈራል አገናኙን ያግኙ',
    referral_step2_title: '2. አገናኝ ያጋሩ',
    referral_step2_desc: 'አገናኙን ከጓደኞችዎ እና ከቤተሰብዎ ጋር በማህበራዊ ሚዲያ ወይም መልዕክት ይጋሩ',
    referral_step3_title: '3. 50 ብር ያግኙ',
    referral_step3_desc: 'ማመልከቻቸውን እና ክፍያቸውን ሲያጠናቅቁ 50 ብር ያገኛሉ',
    referral_step4_title: '4. ይከፈሉ',
    referral_step4_desc: 'ገቢዎን በቴሌብር፣ በአቢሲኒያ ባንክ ወይም በሲቢኢ ይቀበሉ',

    // Payment Methods
    payment_title: 'ቀላል እና ደህንነቱ የተጠበቀ ክፍያ',
    payment_subtitle: 'ለሁሉም ግብይቶች የሚገኙ የክፍያ ዘዴዎች',

    // How It Works
    works_title: 'እንዴት ይሰራል',
    works_step1: 'ቀላሉን ቅጽ ይሙሉ',
    works_step2: 'ፎቶዎን ይስቀሉ',
    works_step3: 'ይገምግሙ እና ይላኩ',
    works_step4: '450 ብር በደህንነት ይክፈሉ',
    works_step5: 'ወዲያውኑ ማረጋገጫ ያግኙ',

    // Features
    features_title: 'ለምን ኢቶ-ዲቪን ይምረጡ',
    feature1_title: 'ፕሮፌሽናል አገልግሎት',
    feature1_desc: 'በማመልከቻ ሂደትዎ ውስጥ የባለሙያ መመሪያ',
    feature2_title: 'ደህንነቱ የተጠበቀ',
    feature2_desc: 'የባንክ ደረጃ ምስጠራ የግል መረጃዎን ይጠብቃል',
    feature3_title: 'ፈጣን ሂደት',
    feature3_desc: 'ማመልከቻዎን በ10 ደቂቃ ውስጥ ያጠናቅቁ',
    feature4_title: '24/7 ድጋፍ',
    feature4_desc: 'በማንኛውም ጊዜ ከድጋፍ ቡድናችን እገዛ ያግኙ',


    // CTA
    cta_title: 'ለማመልከት ዝግጁ ነዎት?',
    cta_subtitle: 'ዛሬ በሺዎች የሚቆጠሩ ስኬታማ አመልካቾችን ይቀላቀሉ',
    cta_button: 'ማመልከቻዎን ይጀምሩ',

    // Footer
    footer_copyright: '© 2024 ኢቶ-ዲቪ። መብት የተጠበቀ።',
    footer_terms: 'ውሎች',
    footer_privacy: 'ግላዊነት',
    footer_contact: 'ያግኙን',
  },
  ti: {
    // Hero Section
    hero_title: 'ናብ',
    hero_highlight: 'ሕልሚ ኣሜሪካ',
    hero_subtitle: 'ናይ ዲቪ ሎተሪ ምልክታኻ ብደቓይቕ ኣዛዝም። ፕሮፌሽናል፣ ውሑስ ከምኡውን ተመጣጣኒ።',
    hero_price: '450 ብር',
    hero_cta: 'ምልክት ጀምር',
    hero_secondary: 'ዝያዳ ፈልጥ',

    // Referral Program
    referral_badge: 'ገንዘብ ተቐበል',
    referral_title: 'ኣዕሩኽቲ ኣካፍል፣ 50 ብር ተቐበል',
    referral_subtitle: 'ፍሉይ ናይ ሪፈራል መወከሲኻ ኣካፍል እሞ ንነፍሲ ወከፍ ዕዉት ምልክት 50 ብር ተቐበል',
    referral_cta: 'ናይ ሪፈራል መወከሲ ተቐበል',

    // How Referral Works
    referral_how_title: 'ሪፈራል ከመይ ይሰርሕ',
    referral_step1_title: '1. ምዝገባ',
    referral_step1_desc: 'ናጻ መለያኻ ፍጠር እሞ ፍሉይ ናይ ሪፈራል መወከሲኻ ተቐበል',
    referral_step2_title: '2. መወከሲ ኣካፍል',
    referral_step2_desc: 'መወከስኻ ምስ ኣዕሩኽትኻን ስድራቤትካን ብሶሻል ሚድያ ወይ መልእኽቲ ኣካፍል',
    referral_step3_title: '3. 50 ብር ተቐበል',
    referral_step3_desc: 'ምልክቶምን ክፍሊቶምን ምስ ዛዘመ 50 ብር ትረክብ',
    referral_step4_title: '4. ክፍሊት ተቐበል',
    referral_step4_desc: 'ኣታዊኻ ብቴሌብር፣ ኣቢሲንያ ባንክ ወይ ሲቢኢ ተቐበል',

    // Payment Methods
    payment_title: 'ቀሊል ውሑስ ክፍሊት',
    payment_subtitle: 'ንኹሎም ግብሪታት ዝርከቡ ናይ ክፍሊት መገድታት',

    // How It Works
    works_title: 'ከመይ ይሰርሕ',
    works_step1: 'ቀሊል ቅጥዒ ምላእ',
    works_step2: 'ስእልኻ ስቐል',
    works_step3: 'ግምገምን ስደድን',
    works_step4: '450 ብር ብውሑስ ክፈል',
    works_step5: 'ብኣህጉራዊ መረጋገጺ ተቐበል',

    // Features
    features_title: 'ስለምንታይ ኢቶ-ዲቪ ትመርጽ',
    feature1_title: 'ፕሮፌሽናል ኣገልግሎት',
    feature1_desc: 'ኣብ ናይ ምልክት ሂደትካ ናይ ሞያ መሃርቲ',
    feature2_title: 'ውሑስን ፕራይቨትን',
    feature2_desc: 'ናይ ባንክ ደረጃ ምስጥራዊ ውልቃዊ ዳታኻ የሕልን',
    feature3_title: 'ቅልጡፍ መስርሕ',
    feature3_desc: 'ምልክትካ ኣብ ውሽጢ 10 ደቓይቕ ዛዝም',
    feature4_title: '24/7 ደገፍ',
    feature4_desc: 'ኣብ ዝኾነ ግዜ ካብ ናይ ደገፍ ጉጅለና ሓገዝ ተቐበል',


    // CTA
    cta_title: 'ንምልክት ድሉው ዲኻ?',
    cta_subtitle: 'ሎሚ ብኣሽሓት ዝቑጸሩ ዓዋታት ተቐላቐል',
    cta_button: 'ምልክትካ ጀምር',

    // Footer
    footer_copyright: '© 2024 ኢቶ-ዲቪ። መሰል ተሓልዩ።',
    footer_terms: 'ኵነታት',
    footer_privacy: 'ፕራይቨሲ',
    footer_contact: 'ርኸቡና',
  },
  or: {
    // Hero Section
    hero_title: 'Karaa',
    hero_highlight: 'Abjuu Ameerikaa',
    hero_subtitle: 'Iyyata DV Lottery kee daqiiqoota keessatti xumuri. Ogeessa, nageenya qabuufi gatii madaalawaa.',
    hero_price: '450 Birr',
    hero_cta: 'Iyyata Jalqabi',
    hero_secondary: 'Dabalataan Beeki',

    // Referral Program
    referral_badge: 'Maallaqa Argadhu',
    referral_title: 'Hiriyyoota Qooddadhu, 50 Birr Argadhu',
    referral_subtitle: 'Linkii referral addaa kee qooddadhuutii iyyata milkaawe hundaaf 50 Birr argadhu',
    referral_cta: 'Linkii Referral Argadhu',

    // How Referral Works
    referral_how_title: 'Referral Akkamitti Hojjeta',
    referral_step1_title: '1. Galmaadhuu',
    referral_step1_desc: 'Akkaawuntii bilisaa kee uumiitii linkii referral addaa kee argadhu',
    referral_step2_title: '2. Linkii Qooddadhu',
    referral_step2_desc: 'Linkii kee hiriyyootakee fi maatii kee waliin karaa media hawaasaaatiin qooddadhu',
    referral_step3_title: '3. 50 Birr Argadhu',
    referral_step3_desc: 'Yeroo isaan iyyata isaaniifi kaffaltii isaanii xumuratan 50 Birr argatta',
    referral_step4_title: '4. Kaffaltii Argadhu',
    referral_step4_desc: 'Galii kee karaa Telebirr, Baankii Abyssinia ykn CBE argadhu',

    // Payment Methods
    payment_title: 'Kaffaltii Salphaa fi Nageenya Qabu',
    payment_subtitle: 'Mala kaffaltii daldala hundaaf jiru',

    // How It Works
    works_title: 'Akkamitti Hojjeta',
    works_step1: 'Unka salphaa guuti',
    works_step2: 'Suuraa kee fe\'i',
    works_step3: 'Gamaaggamiitii ergi',
    works_step4: '450 Birr nageenya qabuun kaffali',
    works_step5: 'Battalumatti mirkaneessa argadhu',

    // Features
    features_title: 'Maaliif Etho-DV Filachuu?',
    feature1_title: 'Tajaajila Ogeessa',
    feature1_desc: 'Adeemsa iyyata kee keessatti qajeelfama ogeessaa',
    feature2_title: 'Nageenya Qabuufi Dhuunfaa',
    feature2_desc: 'Encryption sadarkaa baankii daataa dhuunfaa kee eega',
    feature3_title: 'Adeemsa Saffisaa',
    feature3_desc: 'Iyyata kee daqiiqoota 10 gadi keessatti xumuri',
    feature4_title: '24/7 Deeggarsa',
    feature4_desc: 'Yeroo kamiyyuu garee deeggarsa keenyaa irraa gargaarsa argadhu',


    // CTA
    cta_title: 'Iyyachuuf Qophii Dha?',
    cta_subtitle: 'Har\'a kumaatama iyyattota milkaa\'oo waliin makamadhu',
    cta_button: 'Iyyata Kee Jalqabi',

    // Footer
    footer_copyright: '© 2024 Etho-DV. Mirga hunduu qabame.',
    footer_terms: 'Seera',
    footer_privacy: 'Dhuunfaa',
    footer_contact: 'Nu Quunnamaa',
  }
};

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState('en');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        // Redirect to dashboard if authenticated
        try {
          const user = JSON.parse(userData);
          if (user.role === 'agent') {
            router.push(`/${locale}/agent`);
          } else if (user.role === 'admin') {
            router.push(`/${locale}/admin`);
          } else {
            router.push(`/${locale}/dashboard`);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [locale, router]);

  const t = content[locale as keyof typeof content] || content.en;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'ti', name: 'ትግርኛ', flag: '🇪🇹' },
    { code: 'or', name: 'Oromifa', flag: '🇪🇹' }
  ];

  const changeLanguage = (newLocale: string) => {
    setIsLanguageOpen(false);
    router.push(`/${newLocale}`);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Etho-DV
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200"
                >
                  <span className="text-lg">{languages.find(l => l.code === locale)?.flag}</span>
                  <span className="font-medium text-gray-700 text-sm">{languages.find(l => l.code === locale)?.name}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLanguageOpen && (
                  <div className="absolute top-14 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48 animate-in fade-in slide-in-from-top-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                          locale === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {locale === lang.code && (
                          <CheckCircleIcon className="w-5 h-5 ml-auto text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <Link
                href={`/${locale}/login`}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-sm hover:shadow-lg transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Language Selector - Floating (Removed, now in header) */}
      <div className="hidden fixed top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            <span className="text-xl">{languages.find(l => l.code === locale)?.flag}</span>
            <span className="font-medium text-gray-700">{languages.find(l => l.code === locale)?.name}</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLanguageOpen && (
            <div className="absolute top-14 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-48 animate-in fade-in slide-in-from-top-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                    locale === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {locale === lang.code && (
                    <CheckCircleIcon className="w-5 h-5 ml-auto text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              {t.hero_title}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.hero_highlight}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={`/${locale}/apply`}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                {t.hero_cta}
              </Link>
              <div className="flex items-center space-x-2 px-6 py-4 bg-white rounded-full shadow-md">
                <span className="text-2xl font-bold text-blue-600">{t.hero_price}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold mb-4">
              {t.referral_badge}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.referral_title}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t.referral_subtitle}
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href={`/${locale}/register`}
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              {t.referral_cta}
            </Link>
          </div>
        </div>
      </section>

      {/* How Referral Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            {t.referral_how_title}
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t.referral_step1_title}
                </h3>
                <p className="text-gray-600">
                  {t.referral_step1_desc}
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <ShareIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t.referral_step2_title}
                </h3>
                <p className="text-gray-600">
                  {t.referral_step2_desc}
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t.referral_step3_title}
                </h3>
                <p className="text-gray-600">
                  {t.referral_step3_desc}
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t.referral_step4_title}
                </h3>
                <p className="text-gray-600">
                  {t.referral_step4_desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.payment_title}
            </h2>
            <p className="text-xl text-gray-600">
              {t.payment_subtitle}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Telebirr */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-4 shadow-md p-2">
                    <img
                      src="/images/telebirr-logo.png"
                      alt="Telebirr"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextEl) nextEl.style.display = 'block';
                      }}
                    />
                    <span className="text-4xl hidden">💳</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Telebirr</span>
                  <span className="text-sm text-gray-600 mt-1">Mobile Money</span>
                </div>

                {/* CBE */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-4 shadow-md p-2">
                    <img
                      src="/images/cbe-logo.png"
                      alt="Commercial Bank of Ethiopia"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextEl) nextEl.style.display = 'block';
                      }}
                    />
                    <span className="text-4xl hidden">🏦</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">CBE</span>
                  <span className="text-sm text-gray-600 mt-1 text-center">Commercial Bank of Ethiopia</span>
                </div>

                {/* Abyssinia Bank */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-4 shadow-md p-2">
                    <img
                      src="/images/abyssinia-logo.png"
                      alt="Bank of Abyssinia"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextEl) nextEl.style.display = 'block';
                      }}
                    />
                    <span className="text-4xl hidden">🏛️</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Abyssinia Bank</span>
                  <span className="text-sm text-gray-600 mt-1">Bank of Abyssinia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            {t.works_title}
          </h2>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: 1, text: t.works_step1 },
              { step: 2, text: t.works_step2 },
              { step: 3, text: t.works_step3 },
              { step: 4, text: t.works_step4 },
              { step: 5, text: t.works_step5 }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                  {item.step}
                </div>
                <p className="text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            {t.features_title}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <GlobeAltIcon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.feature1_title}</h3>
              <p className="text-gray-600">{t.feature1_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <ShieldCheckIcon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.feature2_title}</h3>
              <p className="text-gray-600">{t.feature2_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <ClockIcon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.feature3_title}</h3>
              <p className="text-gray-600">{t.feature3_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <UserGroupIcon className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.feature4_title}</h3>
              <p className="text-gray-600">{t.feature4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.cta_title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t.cta_subtitle}
          </p>
          <Link
            href={`/${locale}/apply`}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {t.cta_button}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">{t.footer_copyright}</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t.footer_terms}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t.footer_privacy}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t.footer_contact}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
