'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
    agent_benefit_4: 'Priority support'
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
    agent_benefit_4: 'ቅድሚያ ያለው ድጋፍ'
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
    agent_benefit_4: 'ቅድሚያ ዝወሃብ ደገፍ'
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
    agent_benefits: 'Faayidaa Bakka Buʼaa',
    agent_benefit_1: 'Iyyada tokkotti 50-100 birr argadhu',
    agent_benefit_2: 'Hir-hirkaan walakkaa',
    agent_benefit_3: 'Dashboard addaa bakka buʼaa',
    agent_benefit_4: 'Deeggarsa duraa'
  }
};

export default function RegisterPage({ params }: RegisterPageProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<string>('en');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'individual',
    businessName: '',
    businessAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle params resolution
  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  // Check URL params for agent type
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'agent') {
      setFormData(prev => ({ ...prev, userType: 'agent' }));
    }
  }, [searchParams]);

  const t = content[locale as keyof typeof content] || content.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required fields
    if (!formData.firstName) newErrors.firstName = t.required;
    if (!formData.lastName) newErrors.lastName = t.required;
    if (!formData.email) newErrors.email = t.required;
    if (!formData.phone) newErrors.phone = t.required;
    if (!formData.password) newErrors.password = t.required;
    if (!formData.confirmPassword) newErrors.confirmPassword = t.required;

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalid_email;
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t.password_min;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwords_no_match;
    }

    // Agent-specific validation
    if (formData.userType === 'agent') {
      if (!formData.businessName) newErrors.businessName = t.required;
      if (!formData.businessAddress) newErrors.businessAddress = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration data:', formData);
      alert(t.success);
      
      // In real app, redirect to dashboard or login
      // router.push(`/${locale}/login`);
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {t.back_home}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {formData.userType === 'agent' ? t.agent_subtitle : t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Agent Benefits (if agent registration) */}
          {formData.userType === 'agent' && (
            <div className="lg:col-span-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  {t.agent_benefits}
                </h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {t.agent_benefit_1}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {t.agent_benefit_2}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {t.agent_benefit_3}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {t.agent_benefit_4}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className={formData.userType === 'agent' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.user_type} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.userType === 'individual' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="individual"
                        checked={formData.userType === 'individual'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{t.individual}</div>
                        <div className="text-sm text-gray-500">$1 per application</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.userType === 'agent' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="agent"
                        checked={formData.userType === 'agent'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{t.agent}</div>
                        <div className="text-sm text-gray-500">Bulk pricing</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.personal_info}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.first_name} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                      />
                      {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.last_name} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                      />
                      {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
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
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+251912345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Business Information (for agents) */}
                {formData.userType === 'agent' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.business_info}</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.business_name} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                        />
                        {errors.businessName && <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>}
                      </div>
                      <div>
                        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.business_address} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="businessAddress"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                        />
                        {errors.businessAddress && <p className="text-red-600 text-sm mt-1">{errors.businessAddress}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.account_info}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        {t.confirm_password} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                      />
                      {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col items-center space-y-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-medium transition-colors text-lg min-h-[44px]"
                  >
                    {isSubmitting ? t.processing : t.register}
                  </button>
                  
                  <p className="text-gray-600 text-center">
                    {t.already_have_account}{' '}
                    <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {t.login}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}