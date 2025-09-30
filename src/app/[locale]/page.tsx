import Link from 'next/link';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const localeConfig = {
  locales: ['en', 'am', 'ti', 'or'],
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

const content = {
  en: {
    title: 'DV Lottery Application Made Simple',
    subtitle: 'Professional DV lottery application service for Ethiopian users. Fast, reliable, and affordable at just $1 USD.',
    apply: 'Apply Now - $1 USD',
    agent: 'Agent Registration',
    features_title: 'Why Choose Etho-DV?',
    affordable_title: 'Affordable Price',
    affordable_desc: 'Only $1 USD per application. Special rates for agents.',
    fast_title: 'Fast Processing', 
    fast_desc: 'Complete your application in minutes, not hours.',
    accurate_title: '100% Accurate',
    accurate_desc: 'Professional form completion with confirmation document.',
    languages_title: 'Available in Your Language',
    copyright: '© 2024 Etho-DV. Professional DV Lottery Application Service.'
  },
  am: {
    title: 'የዲቪ ሎተሪ ማመልከቻ ቀላል ተደርጎላሻል',
    subtitle: 'ለኢትዮጵያዊያን ተጠቃሚዎች ፕሮፌሽናል የዲቪ ሎተሪ ማመልከቻ አገልግሎት። ፈጣን፣ አስተማማኝ እና በ1 ዶላር ብቻ።',
    apply: 'አሁን ያመልክቱ - $1 USD',
    agent: 'ወኪል ምዝገባ',
    features_title: 'ለምን ኢቶ-ዲቪን መምረጥ?',
    affordable_title: 'ተመጣጣኝ ዋጋ',
    affordable_desc: 'በማመልከቻ 1 ዶላር ብቻ። ለወኪሎች ልዩ ዋጋ።',
    fast_title: 'ፈጣን ሂደት',
    fast_desc: 'ማመልከቻዎን በደቂቃዎች ውስጥ አጠናቅቁ።',
    accurate_title: '100% ትክክል',
    accurate_desc: 'ፕሮፌሽናል ፎርም መሙላት እና የማረጋገጫ ሰነድ።',
    languages_title: 'በቋንቋዎ የተሰራ',
    copyright: '© 2024 ኢቶ-ዲቪ። ፕሮፌሽናል የዲቪ ሎተሪ ማመልከቻ አገልግሎት።'
  },
  ti: {
    title: 'የዲቪ ሎተሪ ምዝገባ ቅልጡፍ ተገይሩ',
    subtitle: 'ለኢትዮጵያውያን ተጠቀምቲ ፕሮፈሽናል የዲቪ ሎተሪ ምዝገባ አገልግሎት። ቅልጡፍ፣ ውሑስ እናም በ1 ዶላር ብቻ።',
    apply: 'ሕጂ ተመዝገቡ - $1 USD',
    agent: 'ወኪል ምዝገባ',
    features_title: 'ለምንታይ ኢቶ-ዲቪ?',
    affordable_title: 'ተመጣጣኒ ዋጋ',
    affordable_desc: 'ብሓንቲ ምዝገባ 1 ዶላር ጥራይ። ለወኪሎች ልዩ ዋጋ።',
    fast_title: 'ቅልጡፍ ሂደት',
    fast_desc: 'ምዝገባኻ ብደቓይቕ ውስት ዛዝም።',
    accurate_title: '100% ቅኑዕ',
    accurate_desc: 'ፕሮፈሽናል ፎርም መምላእ እና መረጋገጺ ሰነድ።',
    languages_title: 'ብቋንቋኻ ዝተሰርሐ',
    copyright: '© 2024 ኢቶ-ዲቪ። ፕሮፈሽናል የዲቪ ሎተሪ ምዝገባ አገልግሎት።'
  },
  or: {
    title: 'Iyyada DV Lottery Salphaa Taasifamee',
    subtitle: 'Fayyadamtoota Itoophiyaa DV lottery professional tajaajila. Saffisaa, amanamaa fi $1 USD qofa.',
    apply: 'Amma Iyyaadhu - $1 USD',
    agent: 'Galmee Bakka Bu\'aa',
    features_title: 'Maaliif Etho-DV filachuu?',
    affordable_title: 'Gatii Madaalawaa',
    affordable_desc: 'Iyyada tokkootti $1 USD qofa. Bakka bu\'oota ixaaf gatii addaa.',
    fast_title: 'Adeemsa Saffisaa',
    fast_desc: 'Iyyada keessan daqiiqoota keessatti xumuraa.',
    accurate_title: '100% Sirrii',
    accurate_desc: 'Foormii professional guutuu fi ragaa mirkaneessaa.',
    languages_title: 'Afaan Keessaniin Hojjetame',
    copyright: '© 2024 Etho-DV. Professional DV Lottery iyyada tajaajila.'
  }
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/apply`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium transition-colors text-lg">
                {t.apply}
              </button>
            </Link>
            <Link href={`/${locale}/register?type=agent`}>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-md font-medium transition-colors text-lg">
                {t.agent}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t.features_title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t.affordable_title}
              </h3>
              <p className="text-gray-600">
                {t.affordable_desc}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t.fast_title}
              </h3>
              <p className="text-gray-600">
                {t.fast_desc}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t.accurate_title}
              </h3>
              <p className="text-gray-600">
                {t.accurate_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-language Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            {t.languages_title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {localeConfig.locales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={`p-4 bg-white rounded-lg hover:shadow-md transition-shadow ${locale === loc ? 'ring-2 ring-blue-500' : ''}`}
              >
                <span className="text-2xl mb-2 block">
                  {localeConfig.localeFlags[loc as keyof typeof localeConfig.localeFlags]}
                </span>
                <span className="font-medium">
                  {localeConfig.localeLabels[loc as keyof typeof localeConfig.localeLabels]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p>{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}