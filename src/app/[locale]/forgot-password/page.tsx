'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Reset Your Password',
    subtitle: 'Enter your email address and we\'ll send you a link to reset your password',
    email: 'Email Address',
    send_reset_link: 'Send Reset Link',
    back_login: 'Back to Login',
    remember_password: 'Remember your password?',
    login_here: 'Login here',
    required: 'Required',
    invalid_email: 'Please enter a valid email address',
    processing: 'Sending...',
    success_title: 'Check Your Email',
    success_message: 'We\'ve sent a password reset link to your email address.',
    success_instruction: 'Please check your email and click the link to reset your password.',
    resend_link: 'Didn\'t receive the email? Resend link',
    email_sent: 'Reset link sent successfully!',
    try_again: 'Please try again later'
  },
  am: {
    title: 'የይለፍ ቃልዎን ዳግም ያስቀምጡ',
    subtitle: 'የኢሜይል አድራሻዎን ያስገቡ እና የይለፍ ቃል ዳግም ለማስቀመጥ ማገናኛ እንልክልዎታለን',
    email: 'የኢሜይል አድራሻ',
    send_reset_link: 'የዳግም ማስቀመጫ ማገናኛ ላክ',
    back_login: 'ወደ ግባ ተመለስ',
    remember_password: 'የይለፍ ቃልዎን ያስታውሳሉ?',
    login_here: 'እዚህ ይግቡ',
    required: 'ያስፈልጋል',
    invalid_email: 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ',
    processing: 'እየላከ ነው...',
    success_title: 'ኢሜይልዎን ይመልከቱ',
    success_message: 'የይለፍ ቃል ዳግም ማስቀመጫ ማገናኛ ወደ ኢሜይል አድራሻዎ ልከናል።',
    success_instruction: 'እባክዎ ኢሜይልዎን ይመልከቱ እና የይለፍ ቃልዎን ዳግም ለማስቀመጥ ማገናኛውን ይጫኑ።',
    resend_link: 'ኢሜይሉን አላገኙም? ማገናኛውን እንደገና ላክ',
    email_sent: 'የዳግም ማስቀመጫ ማገናኛ በተሳካ ሁኔታ ተልኳል!',
    try_again: 'እባክዎ በኋላ እንደገና ይሞክሩ'
  },
  ti: {
    title: 'ናይ መሓላለፊ ቃልካ ዳግም ኣቕምጦ',
    subtitle: 'ናይ ኢመይል አድራሻኻ ኣእቱ፣ ናይ መሓላለፊ ቃል ዳግም ንምቕማጥ ማእከላይ ነልክልካ',
    email: 'ናይ ኢመይል አድራሻ',
    send_reset_link: 'ናይ ዳግም ምቕማጥ ማእከላይ ላክ',
    back_login: 'ናብ መኣቶ ተመለስ',
    remember_password: 'ናይ መሓላለፊ ቃልካ ትዝክሮ?',
    login_here: 'ኣብዚ ኣቲወ',
    required: 'የድሊ',
    invalid_email: 'ቅኑዕ ናይ ኢመይል አድራሻ ኣእቱ',
    processing: 'እትላኣኽ...',
    success_title: 'ኢመይልካ ርአ',
    success_message: 'ናይ መሓላለፊ ቃል ዳግም ምቕማጥ ማእከላይ ናብ ኢመይል አድራሻኻ ለኣኽናልካ።',
    success_instruction: 'እባኻ ኢመይልካ ርአ እናተኽወ ናይ መሓላለፊ ቃልካ ዳግም ንምቕማጥ ማእከላይ ተጠቐም።',
    resend_link: 'ኢመይሉ ኣይረኸብካዮን? ማእከላይ ዳግም ላክ',
    email_sent: 'ናይ ዳግም ምቕማጥ ማእከላይ ብዓወት ተላኢኹ!',
    try_again: 'እባኻ ድሕሪት ዳግም ፈትን'
  },
  or: {
    title: 'Jecha Icciitii Kee Irra Deebiisiidhu',
    subtitle: 'Teessoo imeelii kee galchiitii hidhannoo jecha icciitii irra deebisuudhaaf sitti ergina',
    email: 'Teessoo Imeelii',
    send_reset_link: 'Hidhannoo Irra Deebisuu Ergi',
    back_login: 'Gara Seenuutti Deebiʼi',
    remember_password: 'Jecha icciitii kee yaadattaa?',
    login_here: 'Asii seeni',
    required: 'Barbaachisaa',
    invalid_email: 'Teessoo imeelii sirrii galchi',
    processing: 'Ergaa jira...',
    success_title: 'Imeelii Kee Ilaali',
    success_message: 'Hidhannoo jecha icciitii irra deebisuuf gara teessoo imeelii keetii ergeerra.',
    success_instruction: 'Maaloo imeelii kee ilaaluudhaan hidhannoo sana cuqaasiitii jecha icciitii kee irra deebiisi.',
    resend_link: 'Imeelii hin arganne? Hidhannoo irra ergi',
    email_sent: 'Hidhannoo irra deebisuu milkaaʼinaan ergameera!',
    try_again: 'Maaloo booda irra deebiʼii yaali'
  }
};

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  const t = content[locale as keyof typeof content] || content.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!email) newErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t.invalid_email;
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
      
      console.log('Password reset requested for:', email);
      setIsEmailSent(true);
      
    } catch (error) {
      console.error('Password reset error:', error);
      alert(t.try_again);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Password reset link resent to:', email);
      alert(t.email_sent);
      
    } catch (error) {
      console.error('Resend error:', error);
      alert(t.try_again);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
              ← {t.back_login}
            </Link>
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.success_title}
            </h1>
            <p className="text-gray-600 mb-6">
              {t.success_message}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {t.success_instruction}
            </p>
          </div>

          {/* Resend Section */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              {t.resend_link}
            </p>
            <button
              onClick={handleResend}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-medium transition-colors text-lg min-h-[44px]"
            >
              {isSubmitting ? t.processing : t.send_reset_link}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              {t.remember_password}{' '}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 font-medium">
                {t.login_here}
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {t.back_login}
          </Link>
          
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-medium transition-colors text-lg min-h-[44px]"
            >
              {isSubmitting ? t.processing : t.send_reset_link}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            {t.remember_password}{' '}
            <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700 font-medium">
              {t.login_here}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}