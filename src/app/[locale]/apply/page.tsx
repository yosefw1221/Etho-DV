'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ApplyPageProps = {
  params: Promise<{ locale: string }>;
};

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  phone: string;
  address: string;
  education: string;
  maritalStatus: string;
  photo: File | null;
};

const content = {
  en: {
    title: 'Apply for DV Lottery',
    subtitle: 'Complete your DV lottery application in just a few minutes',
    personal_info: 'Personal Information',
    first_name: 'First Name',
    middle_name: 'Middle Name (Optional)',
    last_name: 'Last Name',
    date_of_birth: 'Date of Birth',
    place_of_birth: 'Place of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    passport_number: 'Passport Number',
    passport_expiry: 'Passport Expiry Date',
    phone: 'Phone Number',
    address: 'Address',
    education: 'Education Level',
    marital_status: 'Marital Status',
    single: 'Single',
    married: 'Married',
    upload_photo: 'Upload Photo',
    next: 'Next',
    back_home: 'Back to Home',
    required: 'Required',
    step_1_of_4: 'Step 1 of 4'
  },
  am: {
    title: 'የዲቪ ሎተሪ ማመልከቻ',
    subtitle: 'የዲቪ ሎተሪ ማመልከቻዎን በደቂቃዎች ውስጥ ያጠናቅቁ',
    personal_info: 'የግል መረጃ',
    first_name: 'ስም',
    middle_name: 'የአባት ስም (አማራጭ)',
    last_name: 'የአያት ስም',
    date_of_birth: 'የትውልድ ቀን',
    place_of_birth: 'የትውልድ ቦታ',
    gender: 'ጾታ',
    male: 'ወንድ',
    female: 'ሴት',
    passport_number: 'የፓስፖርት ቁጥር',
    passport_expiry: 'የፓስፖርት ማብቂያ ቀን',
    phone: 'የቴሌፎን ቁጥር',
    address: 'አድራሻ',
    education: 'የትምህርት ደረጃ',
    marital_status: 'የጋብቻ ሁኔታ',
    single: 'ያላገባ',
    married: 'ያገባ',
    upload_photo: 'ፎቶ ይጫኑ',
    next: 'ቀጣይ',
    back_home: 'ወደ መነሻ ይመለሱ',
    required: 'ያስፈልጋል',
    step_1_of_4: 'ደረጃ 1 ከ4'
  },
  ti: {
    title: 'የዲቪ ሎተሪ ምዝገባ',
    subtitle: 'የዲቪ ሎተሪ ምዝገባኻ ብደቓይቕ ውስት ዛዝም',
    personal_info: 'ናይ ውልቀ-ሰብ ሓበሬታ',
    first_name: 'ስም',
    middle_name: 'ናይ አቦ ስም (ኣማራጺ)',
    last_name: 'ናይ ኣያት ስም',
    date_of_birth: 'ናይ ልደት ዕለት',
    place_of_birth: 'ናይ ልደት ቦታ',
    gender: 'ፆታ',
    male: 'ተባዕታይ',
    female: 'ኣንስተይቲ',
    passport_number: 'ናይ ፓስፖርት ቁጽሪ',
    passport_expiry: 'ናይ ፓስፖርት ዝውዳእ ዕለት',
    phone: 'ናይ ተለፎን ቁጽሪ',
    address: 'አድራሻ',
    education: 'ናይ ትምህርቲ ደረጃ',
    marital_status: 'ናይ ጋብቻ ኹነታት',
    single: 'ዘይተመርዐወ',
    married: 'ዝተመርዐወ',
    upload_photo: 'ፎቶ ኣቐምጥ',
    next: 'ቀጻሊ',
    back_home: 'ናብ መበገሲ ተመለስ',
    required: 'የድሊ',
    step_1_of_4: 'ደረጃ 1 ካብ 4'
  },
  or: {
    title: 'Iyyada DV Lottery',
    subtitle: 'Iyyada DV lottery keessan daqiiqoota muraasa keessatti xumuraa',
    personal_info: 'Odeeffannoo Dhuunfaa',
    first_name: 'Maqaa',
    middle_name: 'Maqaa Abbaa (Filannoo)',
    last_name: 'Maqaa Akaakayyuu',
    date_of_birth: 'Guyyaa Dhalootaa',
    place_of_birth: 'Iddoo Dhalootaa',
    gender: 'Saala',
    male: 'Dhiira',
    female: 'Dubartii',
    passport_number: 'Lakkoofsa Paaspoortii',
    passport_expiry: 'Guyyaa Paaspoortiin Dhufaa',
    phone: 'Lakkoofsa Bilbilaa',
    address: 'Teessoo',
    education: 'Sadarkaa Barumsa',
    marital_status: 'Haala Fuudhaa fi Heerumaa',
    single: 'Kan Hin Fuune',
    married: 'Kan Fuudhe',
    upload_photo: 'Suuraa Olkaaʼi',
    next: 'Itti Fufi',
    back_home: 'Gara Jalqaba Deebiʼi',
    required: 'Barbaachisaa',
    step_1_of_4: 'Tarkaanfii 1 4 keessaa'
  }
};

export default function ApplyPage({ params }: ApplyPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    passportNumber: '',
    passportExpiry: '',
    phone: '',
    address: '',
    education: '',
    maritalStatus: '',
    photo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle params resolution
  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  const t = content[locale as keyof typeof content] || content.en;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      photo: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'placeOfBirth', 'gender', 'passportNumber', 'passportExpiry', 'phone', 'address', 'education', 'maritalStatus'];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof FormData]) {
          alert(`Please fill in ${field}`);
          setIsSubmitting(false);
          return;
        }
      }

      if (!formData.photo) {
        alert('Please upload a photo');
        setIsSubmitting(false);
        return;
      }

      // Here you would normally send the data to your API
      console.log('Form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show success message
      alert('Form submitted successfully! This is step 1 of 4.');
      
      // In a real app, you would navigate to the next step
      // router.push(`/${locale}/apply/step2`);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
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
            {t.subtitle}
          </p>
          <div className="text-sm text-gray-500">
            {t.step_1_of_4}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t.personal_info}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-3 gap-4">
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.middle_name}
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
            </div>

            {/* Date of Birth and Place of Birth */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.date_of_birth} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.place_of_birth} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="placeOfBirth"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  required
                  placeholder="Addis Ababa, Ethiopia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.gender} <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleInputChange}
                    className="mr-2"
                    required
                  />
                  {t.male}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleInputChange}
                    className="mr-2"
                    required
                  />
                  {t.female}
                </label>
              </div>
            </div>

            {/* Passport Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passport_number} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passport_expiry} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="passportExpiry"
                  name="passportExpiry"
                  value={formData.passportExpiry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  required
                  placeholder="+251912345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.address} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                />
              </div>
            </div>

            {/* Education and Marital Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.education} <span className="text-red-500">*</span>
                </label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                >
                  <option value="">Select education level</option>
                  <option value="high_school">High School</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.marital_status} <span className="text-red-500">*</span>
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px]"
                >
                  <option value="">{t.marital_status}</option>
                  <option value="single">{t.single}</option>
                  <option value="married">{t.married}</option>
                </select>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                {t.upload_photo} <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <span className="text-gray-600">
                    {formData.photo ? formData.photo.name : t.upload_photo}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    {formData.photo ? 'Photo selected' : 'JPG, PNG (Max 2MB)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md font-medium transition-colors text-lg min-h-[44px]"
              >
                {isSubmitting ? 'Processing...' : `${t.next} →`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}