'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModernRegisterForm from '@/components/auth/ModernRegisterForm';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'individual' | 'agent';
  businessName: string;
  businessAddress: string;
};

const content = {
  en: {
    title: 'Create Account',
    subtitle: 'Join Etho-DV and start your DV lottery application',
    agent_subtitle: 'Register as an agent and earn from DV applications',
    personal_info: 'Personal Information',
    account_info: 'Account Information',
    business_info: 'Business Information',
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    confirm_password: 'Confirm Password',
    user_type: 'Account Type',
    individual: 'Individual User',
    agent: 'Agent/Business',
    business_name: 'Business Name',
    business_address: 'Business Address',
    register: 'Create Account',
    back_home: 'Back to Home',
    already_have_account: 'Already have an account?',
    login: 'Login here',
    required: 'Required',
    processing: 'Creating Account...',
    success: 'Account created successfully!',
    password_min: 'Password must be at least 6 characters',
    passwords_no_match: 'Passwords do not match',
    invalid_email: 'Please enter a valid email',
    agent_benefits: 'Agent Benefits',
    agent_benefit_1: 'Earn 50-100 ETB per application',
    agent_benefit_2: 'Bulk submission discounts',
    agent_benefit_3: 'Dedicated agent dashboard',
    agent_benefit_4: 'Priority support',
    or_continue_with: 'Or continue with',
    google_register: 'Continue with Google',
    telegram_register: 'Continue with Telegram'
  },
  am: {
    title: 'መለያ ይፍጠሩ',
    subtitle: 'ኢቶ-ዲቪን ይቀላቀሉ እና የዲቪ ሎተሪ ማመልከቻዎን ይጀምሩ',
    agent_subtitle: 'እንደ ወኪል ይመዝገቡ እና ከዲቪ ማመልከቻዎች ያትርፉ',
    personal_info: 'የግል መረጃ',
    account_info: 'የመለያ መረጃ',
    business_info: 'የንግድ መረጃ',
    first_name: 'ስም',
    last_name: 'የአያት ስም',
    email: 'ኢሜይል',
    phone: 'የቴሌፎን ቁጥር',
    password: 'የይለፍ ቃል',
    confirm_password: 'የይለፍ ቃል ያረጋግጡ',
    user_type: 'የመለያ አይነት',
    individual: 'ግለሰብ ተጠቃሚ',
    agent: 'ወኪል/ንግድ',
    business_name: 'የንግድ ስም',
    business_address: 'የንግድ አድራሻ',
    register: 'መለያ ይፍጠሩ',
    back_home: 'ወደ መነሻ ይመለሱ',
    already_have_account: 'አስቀድመው መለያ አሎት?',
    login: 'እዚህ ይግቡ',
    required: 'ያስፈልጋል',
    processing: 'መለያ እየተፈጠረ ነው...',
    success: 'መለያ በተሳካ ሁኔታ ተፈጥሯል!',
    password_min: 'የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች መሆን አለበት',
    passwords_no_match: 'የይለፍ ቃሎች አይዛመዱም',
    invalid_email: 'ትክክለኛ ኢሜይል ያስገቡ',
    agent_benefits: 'የወኪል ጥቅሞች',
    agent_benefit_1: 'በማመልከቻ 50-100 ብር ያትርፉ',
    agent_benefit_2: 'የጅምላ ቅናሽ',
    agent_benefit_3: 'ልዩ የወኪል ዳሽቦርድ',
    agent_benefit_4: 'ቅድሚያ ያለው ድጋፍ',
    or_continue_with: 'ወይም ቀጥል በ',
    google_register: 'በGoogle ቀጥል',
    telegram_register: 'በTelegram ቀጥል'
  },
  ti: {
    title: 'መለያ ፍጠር',
    subtitle: 'ኢቶ-ዲቪ ተቀላቀል እና ናይ ዲቪ ሎተሪ ምዝገባኻ ጀምር',
    agent_subtitle: 'ከም ወኪል ተመዝገብ እና ካብ ዲቪ ምዝገባታት ተረፍ',
    personal_info: 'ናይ ውልቀ-ሰብ ሓበሬታ',
    account_info: 'ናይ መለያ ሓበሬታ',
    business_info: 'ናይ ንግዲ ሓበሬታ',
    first_name: 'ስም',
    last_name: 'ናይ ኣያት ስም',
    email: 'ኢመይል',
    phone: 'ናይ ተለፎን ቁጽሪ',
    password: 'ናይ መሓላለፊ ቃል',
    confirm_password: 'ናይ መሓላለፊ ቃል ኣረጋግጽ',
    user_type: 'ናይ መለያ ዓይነት',
    individual: 'ውልቀ-ሰብ ተጠቃሚ',
    agent: 'ወኪል/ንግዲ',
    business_name: 'ናይ ንግዲ ስም',
    business_address: 'ናይ ንግዲ አድራሻ',
    register: 'መለያ ፍጠር',
    back_home: 'ናብ መበገሲ ተመለስ',
    already_have_account: 'ቅድሚ ሕጂ መለያ አሎካ?',
    login: 'አብዚ ኣተወ',
    required: 'የድሊ',
    processing: 'መለያ እየተፈጠረ...',
    success: 'መለያ ብዓወት ተፈጢሩ!',
    password_min: 'ናይ መሓላለፊ ቃሉ ብትንሹ 6 ፊደላት ክኸውን አለዎ',
    passwords_no_match: 'ናይ መሓላለፊ ቃላት ኣይረዳዳእን',
    invalid_email: 'ቅኑዕ ኢመይል ኣእቱ',
    agent_benefits: 'ናይ ወኪል ረብሓታት',
    agent_benefit_1: 'ብምዝገባ 50-100 ብር ተረፍ',
    agent_benefit_2: 'ናይ ጅምላ ቅናሽ',
    agent_benefit_3: 'ፍሉይ ናይ ወኪል ዳሽቦርድ',
    agent_benefit_4: 'ቅድሚያ ዝወሃብ ደገፍ',
    or_continue_with: 'ወይ ቀጽል ብ',
    google_register: 'ብGoogle ቀጽል',
    telegram_register: 'ብTelegram ቀጽል'
  },
  or: {
    title: 'Herregaa Uumi',
    subtitle: 'Etho-DV makadami DV lottery iyyada jalqabi',
    agent_subtitle: 'Akka bakka buʼaa galmeeffami DV iyyada irraa buʼaa argadhu',
    personal_info: 'Odeeffannoo Dhuunfaa',
    account_info: 'Odeeffannoo Herregaa',
    business_info: 'Odeeffannoo Daldalaa',
    first_name: 'Maqaa',
    last_name: 'Maqaa Akaakayyuu',
    email: 'Imeelii',
    phone: 'Lakkoofsa Bilbilaa',
    password: 'Jecha Icciitii',
    confirm_password: 'Jecha Icciitii Mirkaneessi',
    user_type: 'Gosa Herregaa',
    individual: 'Fayyadamaa Dhuunfaa',
    agent: 'Bakka Buʼaa/Daldala',
    business_name: 'Maqaa Daldalaa',
    business_address: 'Teessoo Daldalaa',
    register: 'Herregaa Uumi',
    back_home: 'Gara Jalqaba Deebiʼi',
    already_have_account: 'Herregaan qabdaa?',
    login: 'Asii seeni',
    required: 'Barbaachisaa',
    processing: 'Herregaan uumamaa jira...',
    success: 'Herregaan milkaaʼinaan uumame!',
    password_min: 'Jecha icciitiin yoo xiqqaate arfii 6 qabaachuu qaba',
    passwords_no_match: 'Jechoota icciitii wal hin siман',
    invalid_email: 'Imeelii sirrii galchi',
    agent_benefits: 'Faayidaa Bakka Bu\'aa',
    agent_benefit_1: 'Iyyada tokkotti 50-100 birr argadhu',
    agent_benefit_2: 'Hir-hirkaan walakkaa',
    agent_benefit_3: 'Dashboard addaa bakka bu\'aa',
    agent_benefit_4: 'Deeggarsa duraa',
    or_continue_with: 'Ykn itti fufi',
    google_register: 'Google waliin itti fufi',
    telegram_register: 'Telegram waliin itti fufi'
  }
};

export default function RegisterPage({ params }: RegisterPageProps) {
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
      <div className="relative w-full max-w-4xl">
        <ModernRegisterForm locale={locale} />
      </div>
    </div>
  );
}