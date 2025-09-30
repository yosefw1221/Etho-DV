'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Profile Settings',
    subtitle: 'Manage your account information and preferences',
    personal_info: 'Personal Information',
    account_settings: 'Account Settings',
    preferences: 'Preferences',
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    language: 'Preferred Language',
    notifications: 'Email Notifications',
    password: 'Password',
    change_password: 'Change Password',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm New Password',
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    back_dashboard: 'Back to Dashboard',
    update_success: 'Profile updated successfully!',
    password_updated: 'Password changed successfully!',
    required: 'Required',
    invalid_email: 'Please enter a valid email',
    password_mismatch: 'Passwords do not match',
    english: 'English',
    amharic: 'አማርኛ (Amharic)',
    tigrigna: 'ትግርኛ (Tigrigna)',
    oromifa: 'ኦሮምኛ (Oromifa)',
    enable_notifications: 'Receive email notifications for application updates',
    processing: 'Updating...'
  },
  am: {
    title: 'የመገለጫ ቅንብሮች',
    subtitle: 'የመለያ መረጃዎችን እና ምርጫዎችን ያስተዳድሩ',
    personal_info: 'የግል መረጃ',
    account_settings: 'የመለያ ቅንብሮች',
    preferences: 'ምርጫዎች',
    first_name: 'ስም',
    last_name: 'የአባት ስም',
    email: 'ኢሜይል አድራሻ',
    phone: 'የስልክ ቁጥር',
    language: 'የተመረጠ ቋንቋ',
    notifications: 'የኢሜይል ማሳወቂያዎች',
    password: 'የይለፍ ቃል',
    change_password: 'የይለፍ ቃል ይቀይሩ',
    current_password: 'አሁኑ የይለፍ ቃል',
    new_password: 'አዲስ የይለፍ ቃል',
    confirm_password: 'አዲሱን የይለፍ ቃል ያረጋግጡ',
    save_changes: 'ለውጦችን ያስቀምጡ',
    cancel: 'ሰርዝ',
    back_dashboard: 'ወደ ዳሽቦርድ ይመለሱ',
    update_success: 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!',
    password_updated: 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!',
    required: 'ያስፈልጋል',
    invalid_email: 'ትክክለኛ ኢሜይል ያስገቡ',
    password_mismatch: 'የይለፍ ቃሎች አይዛመዱም',
    english: 'English',
    amharic: 'አማርኛ (Amharic)',
    tigrigna: 'ትግርኛ (Tigrigna)',
    oromifa: 'ኦሮምኛ (Oromifa)',
    enable_notifications: 'ለማመልከቻ ዝማኔዎች የኢሜይል ማሳወቂያዎችን ይቀበሉ',
    processing: 'እየዘመነ ነው...'
  },
  ti: {
    title: 'ናይ መልክዕ ምቁጻር',
    subtitle: 'ናይ መለያ ሓበሬታን ምርጫታትን ዝቆጻጸር',
    personal_info: 'ናይ ውልቀሰብ ሓበሬታ',
    account_settings: 'ናይ መለያ ምቁጻራት',
    preferences: 'ምርጫታት',
    first_name: 'ስም',
    last_name: 'ስም አቦ',
    email: 'ኢመይል አድራሻ',
    phone: 'ናይ ተለፎን ቁጽሪ',
    language: 'ዝተመረጸ ቋንቋ',
    notifications: 'ናይ ኢመይል ማሳወቂታት',
    password: 'ናይ መሓላለፊ ቃል',
    change_password: 'ናይ መሓላለፊ ቃል ቀይር',
    current_password: 'ሕጂ ዘሎ ናይ መሓላለፊ ቃል',
    new_password: 'ሓዲሽ ናይ መሓላለፊ ቃል',
    confirm_password: 'ሓዲሽ ናይ መሓላለፊ ቃል ኣረጋግጽ',
    save_changes: 'ለውጢታት ዕቀቦ',
    cancel: 'ስረዝ',
    back_dashboard: 'ናብ ዳሽቦርድ ተመለስ',
    update_success: 'መልክዕ ብዓወት ተመሓይሹ!',
    password_updated: 'ናይ መሓላለፊ ቃል ብዓወት ተቀይሩ!',
    required: 'የድሊ',
    invalid_email: 'ቅኑዕ ኢመይል ኣእቱ',
    password_mismatch: 'ናይ መሓላለፊ ቃላት ኣይተመሳሰሉን',
    english: 'English',
    amharic: 'አማርኛ (Amharic)',
    tigrigna: 'ትግርኛ (Tigrigna)',
    oromifa: 'ኦሮምኛ (Oromifa)',
    enable_notifications: 'ናይ ምዝገባ ለውጢታት የኢመይል ማሳወቂታት ተቐበል',
    processing: 'እተመሓየሽ...'
  },
  or: {
    title: 'Qindaʼina Eenyummaa',
    subtitle: 'Odeeffannoo herregaa fi filannoo kee bulchi',
    personal_info: 'Odeeffannoo Dhuunfaa',
    account_settings: 'Qindaʼina Herregaa',
    preferences: 'Filannoo',
    first_name: 'Maqaa',
    last_name: 'Maqaa Abbaa',
    email: 'Teessoo Imeelii',
    phone: 'Lakkoofsa Bilbilaa',
    language: 'Afaan Filatame',
    notifications: 'Beeksisa Imeelii',
    password: 'Jecha Icciitii',
    change_password: 'Jecha Icciitii Jijjiiri',
    current_password: 'Jecha Icciitii Ammaa',
    new_password: 'Jecha Icciitii Haaraa',
    confirm_password: 'Jecha Icciitii Haaraa Mirkaneessi',
    save_changes: 'Jijjiirama Olkaaʼi',
    cancel: 'Dhiisi',
    back_dashboard: 'Gara Dashboordii Deebiʼi',
    update_success: 'Eenyummaan milkaaʼinaan fooyya!',
    password_updated: 'Jecha icciitii milkaaʼinaan jijjiirame!',
    required: 'Barbaachisaa',
    invalid_email: 'Imeelii sirrii galchi',
    password_mismatch: 'Jechoota icciitii wal hin simatan',
    english: 'English',
    amharic: 'አማርኛ (Amharic)',
    tigrigna: 'ትግርኛ (Tigrigna)',
    oromifa: 'ኦሮምኛ (Oromifa)',
    enable_notifications: 'Fooyessuu iyyannoodhaaf beeksisa imeelii fudhaadhuu',
    processing: 'Fooyessaa jira...'
  }
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+251912345678',
    language: 'en',
    notifications: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  const t = content[locale as keyof typeof content] || content.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePersonalForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName) newErrors.firstName = t.required;
    if (!formData.lastName) newErrors.lastName = t.required;
    if (!formData.email) newErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalid_email;
    }
    if (!formData.phone) newErrors.phone = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) newErrors.currentPassword = t.required;
    if (!passwordData.newPassword) newErrors.newPassword = t.required;
    if (!passwordData.confirmPassword) newErrors.confirmPassword = t.required;
    else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t.password_mismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Profile updated:', formData);
      alert(t.update_success);
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password changed');
      alert(t.password_updated);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password change error:', error);
      alert('Password change failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}/dashboard`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {t.back_dashboard}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.personal_info}
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.account_settings}
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.preferences}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md"
                  >
                    {isSubmitting ? t.processing : t.save_changes}
                  </button>
                </div>
              </form>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{t.password}</h3>
                      <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      {t.change_password}
                    </button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.current_password} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.currentPassword && <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>}
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.new_password} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.confirm_password} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md"
                        >
                          {isSubmitting ? t.processing : t.save_changes}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.language}
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="en">{t.english}</option>
                    <option value="am">{t.amharic}</option>
                    <option value="ti">{t.tigrigna}</option>
                    <option value="or">{t.oromifa}</option>
                  </select>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.notifications}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications"
                          name="notifications"
                          type="checkbox"
                          checked={formData.notifications}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications" className="font-medium text-gray-700">
                          {t.enable_notifications}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md"
                  >
                    {isSubmitting ? t.processing : t.save_changes}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}