'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import PhotoUploadWithCrop from '@/components/forms/PhotoUploadWithCrop';

type ApplyPageProps = {
  params: Promise<{ locale: string }>;
};

type PersonalInfo = {
  lastName: string;
  firstName: string;
  middleName: string;
  gender: string;
  birthDate: string;
  birthCity: string;
  birthCountry: string;
  countryOfEligibility: string;
  photo: any;
};

type ContactInfo = {
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingPostalCode: string;
  mailingCountry: string;
  countryOfResidence: string;
  phoneNumber: string;
  emailAddress: string;
};

type EducationWork = {
  educationLevel: string;
  workExperience: string;
  occupation: string;
  employer: string;
};

type SpouseInfo = {
  lastName: string;
  firstName: string;
  middleName: string;
  gender: string;
  birthDate: string;
  birthCity: string;
  birthCountry: string;
  photo: any;
};

type ChildInfo = {
  lastName: string;
  firstName: string;
  middleName: string;
  gender: string;
  birthDate: string;
  birthCity: string;
  birthCountry: string;
  photo: any;
};

type FormData = {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  educationWork: EducationWork;
  maritalStatus: string;
  spouseInfo: SpouseInfo;
  numberOfChildren: number;
  children: ChildInfo[];
};

const content = {
  en: {
    title: 'DV Lottery Application - DS-5501 Form',
    subtitle: 'Electronic Diversity Visa Entry Form',

    // Navigation
    back_home: 'Back to Home',
    previous: 'Previous',
    next: 'Next',
    submit: 'Submit Application',

    // Steps
    step_1: 'Personal Information',
    step_2: 'Contact Information',
    step_3: 'Education & Work',
    step_4: 'Spouse Information',
    step_5: 'Children Information',
    step_6: 'Review & Submit',

    // Step 1 - Personal Information
    personal_info_title: 'Part 1: Personal Information',
    last_name: 'Last/Family Name',
    first_name: 'First Name',
    middle_name: 'Middle Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    birth_date: 'Birth Date',
    birth_city: 'Birth City',
    birth_country: 'Birth Country',
    country_eligibility: 'Country of Eligibility for the DV Program',
    upload_photo: 'Upload Photo',
    photo_requirements: 'Photo must be taken within the last 6 months',

    // Step 2 - Contact Information
    contact_info_title: 'Part 2: Contact Information',
    mailing_address: 'Mailing Address (Optional)',
    mailing_city: 'City',
    mailing_state: 'State/Province',
    mailing_postal: 'Postal Code',
    mailing_country: 'Country',
    current_residence: 'Country of Current Residence',
    phone_number: 'Phone Number (Optional)',
    email_address: 'Email Address',

    // Step 3 - Education & Work
    education_work_title: 'Part 3: Education & Work Experience',
    education_level: 'Education Level',
    education_primary: 'Primary School Only',
    education_high_school: 'High School, No Degree',
    education_high_school_degree: 'High School with Degree',
    education_vocational: 'Vocational School',
    education_university: 'Some University Courses',
    education_university_degree: 'University Degree',
    education_graduate: 'Some Graduate Level Courses',
    education_graduate_degree: 'Graduate Degree',
    education_doctorate: 'Doctorate Degree',
    work_experience: 'Work Experience (if no high school degree)',
    occupation: 'Occupation',
    employer: 'Employer',

    // Step 4 - Marital Status & Spouse
    marital_status_title: 'Part 4: Marital Status',
    marital_status: 'Marital Status',
    unmarried: 'Unmarried',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    legally_separated: 'Legally Separated',
    spouse_info_title: 'Spouse Information',
    spouse_required:
      'You must include your spouse even if you do not intend for them to immigrate',

    // Step 5 - Children
    children_title: 'Part 5: Children Information',
    number_children: 'Number of Children',
    children_note:
      'List ALL unmarried children under 21 years of age. Include all biological children and legally adopted children. Do NOT include children who are already U.S. citizens or lawful permanent residents.',
    child_info: 'Child {number} Information',
    add_child: 'Add Child',
    remove_child: 'Remove Child',

    // Step 6 - Review
    review_title: 'Review Your Application',
    review_subtitle:
      'Please review all information carefully before submitting',

    // Common
    required: 'Required',
    optional: 'Optional',
    yes: 'Yes',
    no: 'No',

    // Validation
    validation_required: 'This field is required',
    validation_email: 'Please enter a valid email address',
    validation_phone: 'Please enter a valid phone number',
    validation_date: 'Please enter a valid date',
    validation_age: 'You must be at least 18 years old to apply',
    age_display: 'Age: {age} years old',
    age_requirement: 'Must be at least 18 years old',
    age_valid: 'Age requirement met',
    age_invalid: 'Age requirement not met',

    // Countries (sample - you'd include full list)
    ethiopia: 'Ethiopia',
    usa: 'United States',

    // Success
    success_title: 'Application Submitted Successfully!',
    success_message:
      'Your DV Lottery application has been submitted. Please save your confirmation number for your records.',
    confirmation_number: 'Confirmation Number',
  },

  am: {
    title: 'የዲቪ ሎተሪ ማመልከቻ - DS-5501 ፎርም',
    subtitle: 'ኤሌክትሮኒክ የዳይቨርሲቲ ቪዛ ግቤት ፎርም',

    // Navigation
    back_home: 'ወደ መነሻ ይመለሱ',
    previous: 'ቀዳሚ',
    next: 'ቀጣይ',
    submit: 'ማመልከቻ ይላኩ',

    // Steps
    step_1: 'የግል መረጃ',
    step_2: 'የእውቂያ መረጃ',
    step_3: 'ትምህርት እና ስራ',
    step_4: 'የባል/ሚስት መረጃ',
    step_5: 'የልጆች መረጃ',
    step_6: 'ግምገማ እና ማስገባት',

    // Step 1 - Personal Information
    personal_info_title: 'ክፍል 1፡ የግል መረጃ',
    last_name: 'የአያት ስም',
    first_name: 'ስም',
    middle_name: 'የአባት ስም',
    gender: 'ጾታ',
    male: 'ወንድ',
    female: 'ሴት',
    birth_date: 'የትውልድ ቀን',
    birth_city: 'የትውልድ ከተማ',
    birth_country: 'የትውልድ ሀገር',
    country_eligibility: 'ለዲቪ ፕሮግራም ብቁ የሆነ ሀገር',
    upload_photo: 'ፎቶ ይጫኑ',
    photo_requirements: 'ፎቶው ባለፉት 6 ወራት ውስጥ የተነሳ መሆን አለበት',

    // Step 2 - Contact Information
    contact_info_title: 'ክፍል 2፡ የእውቂያ መረጃ',
    mailing_address: 'የፖስታ አድራሻ (አማራጭ)',
    mailing_city: 'ከተማ',
    mailing_state: 'ግዛት/ክልል',
    mailing_postal: 'የፖስታ ኮድ',
    mailing_country: 'ሀገር',
    current_residence: 'የአሁኑ መኖሪያ ሀገር',
    phone_number: 'ስልክ ቁጥር (አማራጭ)',
    email_address: 'ኢሜል አድራሻ',

    // Step 3 - Education & Work
    education_work_title: 'ክፍል 3፡ ትምህርት እና የስራ ልምድ',
    education_level: 'የትምህርት ደረጃ',
    education_primary: 'የመጀመሪያ ደረጃ ብቻ',
    education_high_school: 'ሁለተኛ ደረጃ፣ ዲግሪ የሌለው',
    education_high_school_degree: 'ሁለተኛ ደረጃ ከዲግሪ ጋር',
    education_vocational: 'የሙያ ትምህርት ቤት',
    education_university: 'አንዳንድ የዩኒቨርስቲ ትምህርቶች',
    education_university_degree: 'የዩኒቨርስቲ ዲግሪ',
    education_graduate: 'አንዳንድ የድህረ ምረቃ ትምህርቶች',
    education_graduate_degree: 'የድህረ ምረቃ ዲግሪ',
    education_doctorate: 'የዶክትሬት ዲግሪ',
    work_experience: 'የስራ ልምድ (ሁለተኛ ደረጃ ዲግሪ የሌለ ከሆነ)',
    occupation: 'ሙያ',
    employer: 'ቀጣሪ',

    // Step 4 - Marital Status & Spouse
    marital_status_title: 'ክፍል 4፡ የጋብቻ ሁኔታ',
    marital_status: 'የጋብቻ ሁኔታ',
    unmarried: 'ያላገባ/ች',
    married: 'ያገባ/ች',
    divorced: 'የፈታ/ች',
    widowed: 'የሞተበት/በት',
    legally_separated: 'በህግ የተለዩ',
    spouse_info_title: 'የባል/ሚስት መረጃ',
    spouse_required: 'ለስደት ቢያስቡም ባያስቡም ባለቤትዎን ማካተት አለብዎት',

    // Step 5 - Children
    children_title: 'ክፍል 5፡ የልጆች መረጃ',
    number_children: 'የልጆች ቁጥር',
    children_note:
      'ከ21 ዓመት በታች ያላገቡ ልጆች ሁሉ ዝርዝር ያድርጉ። ሁሉንም ባዮሎጂካል ልጆች እና በህጋዊ መንገድ የተቀበሉ ልጆችን ያካትቱ። አሜሪካ ዜጋ ወይም ህጋዊ ቋሚ ነዋሪ የሆኑ ልጆችን አያካትቱ።',
    child_info: 'ልጅ {number} መረጃ',
    add_child: 'ልጅ ጨምር',
    remove_child: 'ልጅ አስወግድ',

    // Step 6 - Review
    review_title: 'ማመልከቻዎን ይገምግሙ',
    review_subtitle: 'ከማስገባትዎ በፊት ሁሉንም መረጃዎች በጥንቃቄ ይገምግሙ',

    // Common
    required: 'ያስፈልጋል',
    optional: 'አማራጭ',
    yes: 'አዎ',
    no: 'አይ',

    // Validation
    validation_required: 'ይህ መስክ ያስፈልጋል',
    validation_email: 'እባክዎ ትክክለኛ ኢሜል አድራሻ ያስገቡ',
    validation_phone: 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ',
    validation_date: 'እባክዎ ትክክለኛ ቀን ያስገቡ',
    validation_age: 'ለዲቪ ሎተሪ ለማመልከት ቢያንስ 18 ዓመት መሆን አለብዎት',
    age_display: 'እድሜ: {age} ዓመት',
    age_requirement: 'ቢያንስ 18 ዓመት መሆን አለበት',
    age_valid: 'የእድሜ መስፈርት ተሟልቷል',
    age_invalid: 'የእድሜ መስፈርት አልተሟላም',

    // Countries
    ethiopia: 'ኢትዮጵያ',
    usa: 'አሜሪካ',

    // Success
    success_title: 'ማመልከቻ በተሳካ ሁኔታ ተልኳል!',
    success_message: 'የዲቪ ሎተሪ ማመልከቻዎ ተልኳል። እባክዎ የማረጋገጫ ቁጥርዎን ለመዝገብዎ ያስቀምጡ።',
    confirmation_number: 'የማረጋገጫ ቁጥር',
  },

  ti: {
    title: 'ዲቪ ሎተሪ ምዝገባ - DS-5501 ፎርም',
    subtitle: 'ኤሌክትሮኒክ ዳይቨርሲቲ ቪዛ ምእታው ፎርም',

    // Navigation
    back_home: 'ናብ መበገሲ ተመለስ',
    previous: 'ዝሓለፈ',
    next: 'ቀጻሊ',
    submit: 'ምዝገባ ሕብር',

    // Steps
    step_1: 'ውልቃዊ ሓበሬታ',
    step_2: 'ርክብ ሓበሬታ',
    step_3: 'ትምህርቲ ከምኡ ውን ስራሕ',
    step_4: 'ሓበሬታ መጻምድቲ',
    step_5: 'ሓበሬታ ውላድ',
    step_6: 'ግምገማ ከምኡ ውን ሕብር',

    // Step 1 - Personal Information
    personal_info_title: 'ክፋል 1፡ ውልቃዊ ሓበሬታ',
    last_name: 'ስም ቤተሰብ',
    first_name: 'ቀዳማይ ስም',
    middle_name: 'ማእከላይ ስም',
    gender: 'ጾታ',
    male: 'ተባዕታይ',
    female: 'ኣንስተይቲ',
    birth_date: 'ዕለት ልደት',
    birth_city: 'ከተማ ልደት',
    birth_country: 'ሃገር ልደት',
    country_eligibility: 'ንዲቪ ፕሮግራም ብቁዕ ዝኾነ ሃገር',
    upload_photo: 'ፎቶ ጽዕን',
    photo_requirements: 'ፎቶ ኣብ ዝሓለፉ 6 ኣዋርሕ ውሽጢ ዝተወስደ ክኸውን ኣለዎ',

    // Step 2 - Contact Information
    contact_info_title: 'ክፋል 2፡ ሓበሬታ ርክብ',
    mailing_address: 'ኣድራሻ ፖስታ (ኣማራጺ)',
    mailing_city: 'ከተማ',
    mailing_state: 'ግዛት/ክልል',
    mailing_postal: 'ኮድ ፖስታ',
    mailing_country: 'ሃገር',
    current_residence: 'ሃገር ናይ ህሉው መንበሪ',
    phone_number: 'ቁጽሪ ተሌፎን (ኣማራጺ)',
    email_address: 'ኣድራሻ ኢሜይል',

    // Step 3 - Education & Work
    education_work_title: 'ክፋል 3፡ ትምህርቲ ከምኡ ውን ልምዲ ስራሕ',
    education_level: 'ደረጃ ትምህርቲ',
    education_primary: 'መባእታዊ ቤት ትምህርቲ ጥራይ',
    education_high_school: 'ካልኣይ ደረጃ፡ ዲግሪ የብሉን',
    education_high_school_degree: 'ካልኣይ ደረጃ ምስ ዲግሪ',
    education_vocational: 'ናይ ሞያ ቤት ትምህርቲ',
    education_university: 'ገለ ናይ ዩኒቨርስቲ ትምህርትታት',
    education_university_degree: 'ናይ ዩኒቨርስቲ ዲግሪ',
    education_graduate: 'ገለ ናይ ድሕረ ምረቓ ትምህርትታት',
    education_graduate_degree: 'ናይ ድሕረ ምረቓ ዲግሪ',
    education_doctorate: 'ናይ ዶክቶረት ዲግሪ',
    work_experience: 'ልምዲ ስራሕ (ካልኣይ ደረጃ ዲግሪ እንተ ዘይብሉ)',
    occupation: 'ሞያ',
    employer: 'ኣስራሒ',

    // Step 4 - Marital Status & Spouse
    marital_status_title: 'ክፋል 4፡ ኩነታት ምርዓው',
    marital_status: 'ኩነታት ምርዓው',
    unmarried: 'ዘይተመርዓወ/ት',
    married: 'ዝተመርዓወ/ት',
    divorced: 'ዝተፈላለየ/ት',
    widowed: 'መበለት/መበል',
    legally_separated: 'ብሕጊ ዝተፈላለዩ',
    spouse_info_title: 'ሓበሬታ መጻምድቲ',
    spouse_required: 'ንስደት ከም ዝሓስቡ ወይ ከም ዘይሓስቡ መጻምድትኹም ከተካትቱ ኣለኩም',

    // Step 5 - Children
    children_title: 'ክፋል 5፡ ሓበሬታ ውላድ',
    number_children: 'ቁጽሪ ውላድ',
    children_note:
      'ካብ 21 ዓመት ንታሕቲ ዝተመርዓዉ ዘይኮኑ ውላድ ኵሎም ርዘን ግበሩ። ኵሎም ባዮሎጂካል ውላድ ከምኡውን ብሕጋዊ መንገዲ ዝተቀበልኩም ውላድ ኣካትቱ። ዜጋ ኣሜሪካ ወይ ሕጋዊ ቀዋሚ ነባሪ ዝኾኑ ውላድ ኣይትኣቱ።',
    child_info: 'ውላድ {number} ሓበሬታ',
    add_child: 'ውላድ ወስኽ',
    remove_child: 'ውላድ ኣውጽእ',

    // Step 6 - Review
    review_title: 'ምዝገባኹም ግምግሙ',
    review_subtitle: 'ቅድሚ ምሕባር ኵሉ ሓበሬታ ብጥንቃቐ ግምግሙ',

    // Common
    required: 'የድሊ',
    optional: 'ኣማራጺ',
    yes: 'እወ',
    no: 'አይ',

    // Validation
    validation_required: 'እዚ መስክ የድሊ',
    validation_email: 'በጃኹም ሓቀኛ ኣድራሻ ኢሜይል ኣእትዉ',
    validation_phone: 'በጃኹም ሓቀኛ ቁጽሪ ተሌፎን ኣእትዉ',
    validation_date: 'በጃኹም ሓቀኛ ዕለት ኣእትዉ',
    validation_age: 'ንዲቪ ሎተሪ ንምዝገባ ቢያንስ 18 ዓመት ክትኾኑ ኣለኩም',
    age_display: 'ዕድመ: {age} ዓመት',
    age_requirement: 'ቢያንስ 18 ዓመት ክትኾኑ ኣለኩም',
    age_valid: 'ናይ ዕድመ መስፈርት ተማሊኡ',
    age_invalid: 'ናይ ዕድመ መስፈርት ኣይተማልአን',

    // Countries
    ethiopia: 'ኢትዮጵያ',
    usa: 'ኣሜሪካ',

    // Success
    success_title: 'ምዝገባ ብዓወት ተሰዲዱ!',
    success_message: 'ናይ ዲቪ ሎተሪ ምዝገባኹም ተሰዲዱ። በጃኹም ናይ ምርግጋጽ ቁጽርኹም ንመዝገብኩም ሕዘዎ።',
    confirmation_number: 'ቁጽሪ ምርግጋጽ',
  },

  or: {
    title: 'Iyyannoo DV Lottery - Unka DS-5501',
    subtitle: 'Unka Elektronikii Visa Diversity Galchuu',

    // Navigation
    back_home: 'Gara Jalqaba Deebiʼi',
    previous: 'Duraanii',
    next: 'Itti Fufi',
    submit: 'Iyyannoo Ergii',

    // Steps
    step_1: 'Odeeffannoo Dhuunfaa',
    step_2: 'Odeeffannoo Qunnamtii',
    step_3: 'Barnoota fi Hojii',
    step_4: 'Odeeffannoo Abbaa Warraatti',
    step_5: 'Odeeffannoo Ijoollee',
    step_6: 'Gamaaggamaa fi Ergii',

    // Step 1 - Personal Information
    personal_info_title: 'Kutaa 1፡ Odeeffannoo Dhuunfaa',
    last_name: 'Maqaa Maatii',
    first_name: 'Maqaa Jalqabaa',
    middle_name: 'Maqaa Gidduu',
    gender: 'Saala',
    male: 'Dhiira',
    female: 'Dubartii',
    birth_date: 'Guyyaa Dhaloota',
    birth_city: 'Magaalaa Dhaloota',
    birth_country: 'Biyya Dhaloota',
    country_eligibility: "Biyya Sagantaa DV'f Malaa Ta'e",
    upload_photo: "Suuraa Fe'i",
    photo_requirements:
      "Suuraan ji'oota 6 darban keessatti kan fudhatame ta'uu qaba",

    // Step 2 - Contact Information
    contact_info_title: 'Kutaa 2፡ Odeeffannoo Qunnamtii',
    mailing_address: 'Teessoo Poostaa (Filannoo)',
    mailing_city: 'Magaalaa',
    mailing_state: 'Naannoo/Bulchiinsa',
    mailing_postal: 'Koodii Poostaa',
    mailing_country: 'Biyya',
    current_residence: 'Biyya Bakka Jireenyaa Ammaa',
    phone_number: 'Lakkoofsa Bilbilaa (Filannoo)',
    email_address: 'Teessoo Iimeelii',

    // Step 3 - Education & Work
    education_work_title: 'Kutaa 3፡ Barnoota fi Muuxannoo Hojii',
    education_level: 'Sadarkaa Barnootaa',
    education_primary: 'Barnoota Sadarkaa Jalqabaa Qofa',
    education_high_school: 'Sadarkaa Lammaffaa, Digirii Hin Qabdu',
    education_high_school_degree: 'Sadarkaa Lammaffaa Digirii Wajjin',
    education_vocational: 'Mana Barnoota Ogummaa',
    education_university: 'Barnootawwan Yuunivarsitii Tokko Tokko',
    education_university_degree: 'Digirii Yuunivarsitii',
    education_graduate: 'Barnootawwan Sadarkaa Guddaa Tokko Tokko',
    education_graduate_degree: 'Digirii Sadarkaa Guddaa',
    education_doctorate: 'Digirii Dokitaraa',
    work_experience:
      'Muuxannoo Hojii (digirii sadarkaa lammaffaa yoo hin qabaanne)',
    occupation: 'Hojii',
    employer: 'Hojjechiiftuun',

    // Step 4 - Marital Status & Spouse
    marital_status_title: "Kutaa 4፡ Haala Gaa'elaa",
    marital_status: "Haala Gaa'elaa",
    unmarried: 'Kan Hin Fuune/Heerumne',
    married: 'Kan Fuudhe/Heerumte',
    divorced: 'Kan Hiike',
    widowed: "Dhirsii/Niitiin Kan Du'e",
    legally_separated: 'Seeraan Kan Addaan Bahe',
    spouse_info_title: 'Odeeffannoo Abbaa Warraa',
    spouse_required:
      'Godaanuuf yaadanii ykn hin yaadiin abbaa warraa keessan dabaluutu dirqama',

    // Step 5 - Children
    children_title: 'Kutaa 5፡ Odeeffannoo Ijoollee',
    number_children: 'Lakkoofsa Ijoollee',
    children_note:
      'Ijoollee waggaa 21 gadi kanneen hin fuunee/heerumnee hunda tarreessaa. Ijoollee bayolojikaalii fi ijoollee seeraan fudhatan hunda dabalataa. Ijoollee lammii Ameerikaa ykn jiraatota hayyamaan jiraatan hin dabalatinaa.',
    child_info: 'Odeeffannoo Ijoollee {number}',
    add_child: 'Ijoollee Dabalaa',
    remove_child: 'Ijoollee Balleessaa',

    // Step 6 - Review
    review_title: 'Iyyannoo Keessan Gamaaggamaa',
    review_subtitle:
      'Osoo hin ergin dura odeeffannoo hunda of eeggannoo guutuun gamaaggamaa',

    // Common
    required: 'Barbaachisaa',
    optional: 'Filannoo',
    yes: 'Eeyyee',
    no: 'Lakki',

    // Validation
    validation_required: 'Dirreen kun barbaachisaadha',
    validation_email: "Maaloo teessoo iimeelii sirrii ta'e galchaa",
    validation_phone: "Maaloo lakkoofsa bilbilaa sirrii ta'e galchaa",
    validation_date: "Maaloo guyyaa sirrii ta'e galchaa",
    validation_age: "DV Lottery iyyannoof yoo xiqqaate waggaa 18 ta'uu qabdu",
    age_display: 'Umurii: waggaa {age}',
    age_requirement: "Yoo xiqqaate waggaa 18 ta'uu qaba",
    age_valid: 'Ulaagaan umurii guutameera',
    age_invalid: 'Ulaagaan umurii hin guutamne',

    // Countries
    ethiopia: 'Itoophiyaa',
    usa: 'Ameerikaa',

    // Success
    success_title: "Iyyannoon Milkaa'inaan Ergameera!",
    success_message:
      "Iyyannoon DV Lottery keessan ergameera. Maaloo lakkoofsa mirkanaa'inaa keessanii galmeef kuusaa.",
    confirmation_number: "Lakkoofsa Mirkanaa'inaa",
  },
};

// Helper function to load saved form data
const loadSavedFormData = (): FormData => {
  if (typeof window === 'undefined') {
    return getDefaultFormData();
  }

  try {
    const savedData = localStorage.getItem('dv_form_draft');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Failed to load saved form data:', error);
  }

  return getDefaultFormData();
};

const getDefaultFormData = (): FormData => ({
  personalInfo: {
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    birthDate: '',
    birthCity: '',
    birthCountry: 'Ethiopia',
    countryOfEligibility: 'Ethiopia',
    photo: null,
  },
  contactInfo: {
    mailingAddress: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCountry: '',
    countryOfResidence: 'Ethiopia',
    phoneNumber: '',
    emailAddress: '',
  },
  educationWork: {
    educationLevel: '',
    workExperience: '',
    occupation: '',
    employer: '',
  },
  maritalStatus: '',
  spouseInfo: {
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    birthDate: '',
    birthCity: '',
    birthCountry: 'Ethiopia',
    photo: null,
  },
  numberOfChildren: 0,
  children: [],
});

// Helper function to load saved step
const loadSavedStep = (): number => {
  if (typeof window === 'undefined') {
    return 1;
  }

  try {
    const savedStep = localStorage.getItem('dv_form_step');
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      return step > 0 ? step : 1;
    }
  } catch (error) {
    console.error('Failed to load saved step:', error);
  }

  return 1;
};

export default function ApplyPage({ params }: ApplyPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [currentStep, setCurrentStep] = useState(() => loadSavedStep());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>(() => loadSavedFormData());
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Get calculated age for display
  const currentAge = calculateAge(formData.personalInfo.birthDate);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  // Check for pending form submission after login
  useEffect(() => {
    const checkPendingSubmission = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const pendingSubmission = localStorage.getItem('pending_form_submission');
      
      if (token && pendingSubmission) {
        try {
          const { formData: savedFormData, timestamp } = JSON.parse(pendingSubmission);
          
          // Check if the saved data is not too old (24 hours)
          const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent && savedFormData) {
            // Restore form data
            setFormData(savedFormData);
            
            // Clear the pending submission
            localStorage.removeItem('pending_form_submission');
            
            // Auto-submit the form
            setTimeout(() => {
              if (confirm('Your form is ready to submit. Would you like to submit it now?')) {
                handleSubmit();
              }
            }, 1000);
          } else {
            // Clear old pending submission
            localStorage.removeItem('pending_form_submission');
          }
        } catch (error) {
          console.error('Error processing pending submission:', error);
          localStorage.removeItem('pending_form_submission');
        }
      }
    };

    // Check on component mount
    checkPendingSubmission();
  }, [locale]);

  // Auto-save form data with debounce
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAutoSaving(true);
      const timeoutId = setTimeout(() => {
        localStorage.setItem('dv_form_draft', JSON.stringify(formData));
        setIsAutoSaving(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dv_form_step', currentStep.toString());
    }
  }, [currentStep]);

  const t = content[locale as keyof typeof content] || content.en;

  // Calculate total steps based on form state
  const getTotalSteps = () => {
    let steps = 6; // Personal Info, Contact Info, Education, Photo, Marital Status (includes children), Review
    return steps;
  };

  const totalSteps = getTotalSteps();

  // Form validation functions
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Personal Info
        if (!formData.personalInfo.firstName.trim())
          errors.firstName = t.validation_required;
        if (!formData.personalInfo.lastName.trim())
          errors.lastName = t.validation_required;
        if (!formData.personalInfo.gender)
          errors.gender = t.validation_required;
        if (!formData.personalInfo.birthDate) {
          errors.birthDate = t.validation_required;
        } else {
          const age = calculateAge(formData.personalInfo.birthDate);
          if (age < 18) {
            errors.birthDate = t.validation_age;
          }
        }
        if (!formData.personalInfo.birthCity.trim())
          errors.birthCity = t.validation_required;
        if (!formData.personalInfo.birthCountry)
          errors.birthCountry = t.validation_required;
        if (!formData.personalInfo.countryOfEligibility)
          errors.countryOfEligibility = t.validation_required;
        break;

      case 2: // Contact Info
        if (!formData.contactInfo.emailAddress.trim()) {
          errors.emailAddress = t.validation_required;
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.emailAddress)
        ) {
          errors.emailAddress = t.validation_email;
        }
        if (!formData.contactInfo.countryOfResidence)
          errors.countryOfResidence = t.validation_required;
        break;

      case 3: // Education & Work
        if (!formData.educationWork.educationLevel)
          errors.educationLevel = t.validation_required;
        if (
          (formData.educationWork.educationLevel === 'primary' ||
            formData.educationWork.educationLevel ===
              'high_school_no_degree') &&
          !formData.educationWork.occupation.trim()
        ) {
          errors.occupation = t.validation_required;
        }
        break;

      case 4: // Photo
        if (!formData.personalInfo.photo) errors.photo = t.validation_required;
        break;

      case 5: // Family
        if (!formData.maritalStatus)
          errors.maritalStatus = t.validation_required;
        if (formData.maritalStatus === 'married') {
          if (!formData.spouseInfo.firstName.trim())
            errors.spouseFirstName = t.validation_required;
          if (!formData.spouseInfo.lastName.trim())
            errors.spouseLastName = t.validation_required;
          if (!formData.spouseInfo.gender)
            errors.spouseGender = t.validation_required;
          if (!formData.spouseInfo.birthDate)
            errors.spouseBirthDate = t.validation_required;
          if (!formData.spouseInfo.birthCity.trim())
            errors.spouseBirthCity = t.validation_required;
          if (!formData.spouseInfo.photo)
            errors.spousePhoto = t.validation_required;
        }
        // Validate children if any
        formData.children.forEach((child, index) => {
          if (!child.firstName.trim())
            errors[`child${index}FirstName`] = t.validation_required;
          if (!child.lastName.trim())
            errors[`child${index}LastName`] = t.validation_required;
          if (!child.gender)
            errors[`child${index}Gender`] = t.validation_required;
          if (!child.birthDate)
            errors[`child${index}BirthDate`] = t.validation_required;
          if (!child.birthCity.trim())
            errors[`child${index}BirthCity`] = t.validation_required;
          if (!child.photo)
            errors[`child${index}Photo`] = t.validation_required;
        });
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  const updateEducationWork = (field: keyof EducationWork, value: string) => {
    setFormData((prev) => ({
      ...prev,
      educationWork: {
        ...prev.educationWork,
        [field]: value,
      },
    }));
  };

  const updateSpouseInfo = (field: keyof SpouseInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      spouseInfo: {
        ...prev.spouseInfo,
        [field]: value,
      },
    }));
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          lastName: '',
          firstName: '',
          middleName: '',
          gender: '',
          birthDate: '',
          birthCity: '',
          birthCountry: 'Ethiopia',
          photo: null,
        },
      ],
    }));
  };

  const updateChild = (index: number, field: keyof ChildInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return t.step_1;
      case 2:
        return t.step_2;
      case 3:
        return t.step_3;
      case 4:
        return t.upload_photo || 'Photo';
      case 5:
        return 'Family';
      case 6:
        return t.step_6;
      default:
        return '';
    }
  };

  const renderProgressBar = () => (
    <div className='mb-8'>
      <div className='flex items-center justify-between'>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className='flex flex-col items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step < currentStep
                  ? 'bg-green-600 text-white'
                  : step === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step < currentStep ? <CheckIcon className='w-5 h-5' /> : step}
            </div>
            <span className='text-xs mt-1 text-center max-w-20'>
              {getStepTitle(step)}
            </span>
          </div>
        ))}
      </div>
      <div className='mt-4 bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        {t.personal_info_title}
      </h2>

      {/* Name Fields */}
      <div className='grid md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.last_name} <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.personalInfo.lastName}
            onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.lastName && (
            <p className='mt-1 text-sm text-red-600'>
              {validationErrors.lastName}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.first_name} <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.personalInfo.firstName}
            onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.firstName && (
            <p className='mt-1 text-sm text-red-600'>
              {validationErrors.firstName}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.middle_name}
          </label>
          <input
            type='text'
            value={formData.personalInfo.middleName}
            onChange={(e) => updatePersonalInfo('middleName', e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {t.gender} <span className='text-red-500'>*</span>
        </label>
        <div className='flex space-x-4'>
          <label className='flex items-center'>
            <input
              type='radio'
              name='gender'
              value='male'
              checked={formData.personalInfo.gender === 'male'}
              onChange={(e) => updatePersonalInfo('gender', e.target.value)}
              className='mr-2'
              required
            />
            {t.male}
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='gender'
              value='female'
              checked={formData.personalInfo.gender === 'female'}
              onChange={(e) => updatePersonalInfo('gender', e.target.value)}
              className='mr-2'
              required
            />
            {t.female}
          </label>
        </div>
        {validationErrors.gender && (
          <p className='mt-1 text-sm text-red-600'>{validationErrors.gender}</p>
        )}
      </div>

      {/* Birth Information */}
      <div className='grid md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.birth_date} <span className='text-red-500'>*</span>
          </label>

          <input
            type='date'
            value={formData.personalInfo.birthDate}
            onChange={(e) => updatePersonalInfo('birthDate', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              validationErrors.birthDate ? 'border-red-500' : 'border-gray-300'
            }`}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split('T')[0]
            }
            required
          />
          {formData.personalInfo.birthDate && (
            <div className='mt-1'>
              <p
                className={`text-sm ${
                  currentAge >= 18 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {currentAge >= 18 ? '✓' : '✗'}{' '}
                {t.age_display.replace('{age}', currentAge.toString())}
                {currentAge < 18 && ` (${t.age_requirement})`}
              </p>
            </div>
          )}
          {validationErrors.birthDate && (
            <p className='mt-1 text-sm text-red-600'>
              {validationErrors.birthDate}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.birth_city} <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.personalInfo.birthCity}
            onChange={(e) => updatePersonalInfo('birthCity', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              validationErrors.birthCity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Addis Ababa'
            required
          />
          {validationErrors.birthCity && (
            <p className='mt-1 text-sm text-red-600'>
              {validationErrors.birthCity}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.birth_country} <span className='text-red-500'>*</span>
          </label>
          <select
            value={formData.personalInfo.birthCountry}
            onChange={(e) => updatePersonalInfo('birthCountry', e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            required
          >
            <option value='Ethiopia'>Ethiopia</option>
            {/* Add more countries as needed */}
          </select>
        </div>
      </div>

      {/* Country of Eligibility */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {t.country_eligibility} <span className='text-red-500'>*</span>
        </label>
        <select
          value={formData.personalInfo.countryOfEligibility}
          onChange={(e) =>
            updatePersonalInfo('countryOfEligibility', e.target.value)
          }
          className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          required
        >
          <option value='Ethiopia'>Ethiopia</option>
          {/* Add more countries as needed */}
        </select>
      </div>
    </div>
  );

  const renderContactInfoStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        {t.contact_info_title}
      </h2>

      {/* Mailing Address */}
      <div className='bg-gray-50 p-4 rounded-lg'>
        <h3 className='font-medium text-gray-900 mb-4'>
          {t.mailing_address}{' '}
          <span className='text-sm text-gray-600'>({t.optional})</span>
        </h3>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.mailing_address}
            </label>
            <input
              type='text'
              value={formData.contactInfo.mailingAddress}
              onChange={(e) =>
                updateContactInfo('mailingAddress', e.target.value)
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.mailing_city}
            </label>
            <input
              type='text'
              value={formData.contactInfo.mailingCity}
              onChange={(e) => updateContactInfo('mailingCity', e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.mailing_state}
            </label>
            <input
              type='text'
              value={formData.contactInfo.mailingState}
              onChange={(e) =>
                updateContactInfo('mailingState', e.target.value)
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.mailing_postal}
            </label>
            <input
              type='text'
              value={formData.contactInfo.mailingPostalCode}
              onChange={(e) =>
                updateContactInfo('mailingPostalCode', e.target.value)
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.mailing_country}
            </label>
            <select
              value={formData.contactInfo.mailingCountry}
              onChange={(e) =>
                updateContactInfo('mailingCountry', e.target.value)
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            >
              <option value=''>Select Country</option>
              <option value='Ethiopia'>Ethiopia</option>
              <option value='United States'>United States</option>
              {/* Add more countries */}
            </select>
          </div>
        </div>
      </div>

      {/* Current Residence */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {t.current_residence} <span className='text-red-500'>*</span>
        </label>
        <select
          value={formData.contactInfo.countryOfResidence}
          onChange={(e) =>
            updateContactInfo('countryOfResidence', e.target.value)
          }
          className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          required
        >
          <option value='Ethiopia'>Ethiopia</option>
          {/* Add more countries */}
        </select>
      </div>

      {/* Contact Details */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.phone_number}{' '}
            <span className='text-sm text-gray-600'>({t.optional})</span>
          </label>
          <input
            type='tel'
            value={formData.contactInfo.phoneNumber}
            onChange={(e) => updateContactInfo('phoneNumber', e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
            placeholder='+251912345678'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t.email_address} <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            value={formData.contactInfo.emailAddress}
            onChange={(e) => updateContactInfo('emailAddress', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              validationErrors.emailAddress
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.emailAddress && (
            <p className='mt-1 text-sm text-red-600'>
              {validationErrors.emailAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderEducationWorkStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        {t.education_work_title}
      </h2>

      {/* Education Level */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {t.education_level} <span className='text-red-500'>*</span>
        </label>
        <select
          value={formData.educationWork.educationLevel}
          onChange={(e) =>
            updateEducationWork('educationLevel', e.target.value)
          }
          className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          required
        >
          <option value=''>Select Education Level</option>
          <option value='primary'>{t.education_primary}</option>
          <option value='high_school_no_degree'>
            {t.education_high_school}
          </option>
          <option value='high_school_degree'>
            {t.education_high_school_degree}
          </option>
          <option value='vocational'>{t.education_vocational}</option>
          <option value='university_courses'>{t.education_university}</option>
          <option value='university_degree'>
            {t.education_university_degree}
          </option>
          <option value='graduate_courses'>{t.education_graduate}</option>
          <option value='graduate_degree'>{t.education_graduate_degree}</option>
          <option value='doctorate'>{t.education_doctorate}</option>
        </select>
        {validationErrors.educationLevel && (
          <p className='mt-1 text-sm text-red-600'>
            {validationErrors.educationLevel}
          </p>
        )}
      </div>

      {/* Work Experience (conditional) */}
      {(formData.educationWork.educationLevel === 'primary' ||
        formData.educationWork.educationLevel === 'high_school_no_degree') && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <h3 className='font-medium text-yellow-800 mb-4'>
            {t.work_experience}
          </h3>
          <p className='text-sm text-yellow-700 mb-4'>
            You must have at least 2 years of work experience in an occupation
            that requires at least 2 years of training or experience.
          </p>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.occupation} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.educationWork.occupation}
                onChange={(e) =>
                  updateEducationWork('occupation', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.employer}
              </label>
              <input
                type='text'
                value={formData.educationWork.employer}
                onChange={(e) =>
                  updateEducationWork('employer', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPhotoUploadStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        {t.upload_photo || 'Upload Photo'}
      </h2>

      <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-yellow-800'>
              Important Photo Requirements
            </h3>
            <div className='mt-2 text-sm text-yellow-700'>
              <p>
                {t.photo_requirements ||
                  'Photo must be taken within the last 6 months'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Your Photo <span className='text-red-500'>*</span>
        </label>
        <PhotoUploadWithCrop
          formId='primary-applicant'
          personType='primary'
          required
          currentPhoto={
            formData.personalInfo.photo &&
            typeof formData.personalInfo.photo === 'object'
              ? formData.personalInfo.photo.url
              : undefined
          }
          onUploadSuccess={(result) => {
            updatePersonalInfo('photo', result);
          }}
          onUploadError={(error) => {
            console.error('Photo upload error:', error);
            alert('Photo upload failed: ' + error);
          }}
        />
        {validationErrors.photo && (
          <p className='mt-2 text-sm text-red-600'>{validationErrors.photo}</p>
        )}
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
        <h4 className='font-medium text-blue-900 mb-2'>📋 Photo Guidelines:</h4>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>• Recent photo (within 6 months)</li>
          <li>• White or off-white background</li>
          <li>• JPEG format, will be cropped to 600×600 pixels</li>
          <li>• Face clearly visible, looking directly at camera</li>
          <li>
            • No glasses, hats, or head coverings (except for religious
            purposes)
          </li>
        </ul>
      </div>
    </div>
  );

  const renderFamilyStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        Family Information
      </h2>

      {/* Marital Status */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-4'>
          {t.marital_status} <span className='text-red-500'>*</span>
        </label>
        <div className='grid md:grid-cols-3 gap-4'>
          {[
            'unmarried',
            'married',
            'divorced',
            'widowed',
            'legally_separated',
          ].map((status) => (
            <label
              key={status}
              className='flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'
            >
              <input
                type='radio'
                name='maritalStatus'
                value={status}
                checked={formData.maritalStatus === status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maritalStatus: e.target.value,
                  }))
                }
                className='mr-3'
                required
              />
              {t[status as keyof typeof t] || status}
            </label>
          ))}
        </div>
      </div>

      {/* Spouse Information */}
      {formData.maritalStatus === 'married' && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-blue-900 mb-4'>
            {t.spouse_info_title}
          </h3>
          <p className='text-sm text-blue-700 mb-6'>{t.spouse_required}</p>

          {/* Spouse Name Fields */}
          <div className='grid md:grid-cols-3 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.last_name} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.spouseInfo.lastName}
                onChange={(e) => updateSpouseInfo('lastName', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.first_name} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.spouseInfo.firstName}
                onChange={(e) => updateSpouseInfo('firstName', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.middle_name}
              </label>
              <input
                type='text'
                value={formData.spouseInfo.middleName}
                onChange={(e) => updateSpouseInfo('middleName', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              />
            </div>
          </div>

          {/* Spouse Gender and Birth Info */}
          <div className='grid md:grid-cols-4 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.gender} <span className='text-red-500'>*</span>
              </label>
              <select
                value={formData.spouseInfo.gender}
                onChange={(e) => updateSpouseInfo('gender', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              >
                <option value=''>Select</option>
                <option value='male'>{t.male}</option>
                <option value='female'>{t.female}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.birth_date} <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={formData.spouseInfo.birthDate}
                onChange={(e) => updateSpouseInfo('birthDate', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.birth_city} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.spouseInfo.birthCity}
                onChange={(e) => updateSpouseInfo('birthCity', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t.birth_country} <span className='text-red-500'>*</span>
              </label>
              <select
                value={formData.spouseInfo.birthCountry}
                onChange={(e) =>
                  updateSpouseInfo('birthCountry', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                required
              >
                <option value='Ethiopia'>Ethiopia</option>
                {/* Add more countries */}
              </select>
            </div>
          </div>

          {/* Spouse Photo */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {t.upload_photo} <span className='text-red-500'>*</span>
            </label>
            <PhotoUploadWithCrop
              formId='spouse'
              personType='spouse'
              required
              currentPhoto={
                formData.spouseInfo.photo &&
                typeof formData.spouseInfo.photo === 'object'
                  ? formData.spouseInfo.photo.url
                  : undefined
              }
              onUploadSuccess={(result) => {
                updateSpouseInfo('photo', result);
              }}
              onUploadError={(error) => {
                console.error('Spouse photo upload error:', error);
                alert('Spouse photo upload failed: ' + error);
              }}
            />
            {validationErrors.spousePhoto && (
              <p className='mt-2 text-sm text-red-600'>
                {validationErrors.spousePhoto}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Number of Children */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {t.number_children} <span className='text-red-500'>*</span>
        </label>
        <p className='text-sm text-gray-600 mb-4'>{t.children_note}</p>
        <select
          value={formData.numberOfChildren}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            setFormData((prev) => ({
              ...prev,
              numberOfChildren: num,
              children:
                num === 0
                  ? []
                  : Array.from(
                      { length: num },
                      (_, i) =>
                        prev.children[i] || {
                          lastName: '',
                          firstName: '',
                          middleName: '',
                          gender: '',
                          birthDate: '',
                          birthCity: '',
                          birthCountry: 'Ethiopia',
                          photo: null,
                        }
                    ),
            }));
          }}
          className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
          required
        >
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* Children Information */}
      {formData.numberOfChildren > 0 && (
        <div className='space-y-6'>
          <h3 className='text-lg font-medium text-gray-900'>
            {t.children_title}
          </h3>
          {formData.children.map((child, index) => (
            <div
              key={index}
              className='bg-gray-50 border border-gray-200 rounded-lg p-6'
            >
              <h4 className='text-md font-medium text-gray-900 mb-4'>
                {t.child_info.replace('{number}', (index + 1).toString())}
              </h4>

              {/* Child Name Fields */}
              <div className='grid md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.last_name} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={child.lastName}
                    onChange={(e) =>
                      updateChild(index, 'lastName', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.first_name} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={child.firstName}
                    onChange={(e) =>
                      updateChild(index, 'firstName', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.middle_name}
                  </label>
                  <input
                    type='text'
                    value={child.middleName}
                    onChange={(e) =>
                      updateChild(index, 'middleName', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  />
                </div>
              </div>

              {/* Child Gender and Birth Info */}
              <div className='grid md:grid-cols-4 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.gender} <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={child.gender}
                    onChange={(e) =>
                      updateChild(index, 'gender', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  >
                    <option value=''>Select</option>
                    <option value='male'>{t.male}</option>
                    <option value='female'>{t.female}</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.birth_date} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    value={child.birthDate}
                    onChange={(e) =>
                      updateChild(index, 'birthDate', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.birth_city} <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={child.birthCity}
                    onChange={(e) =>
                      updateChild(index, 'birthCity', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t.birth_country} <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={child.birthCountry}
                    onChange={(e) =>
                      updateChild(index, 'birthCountry', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    required
                  >
                    <option value='Ethiopia'>Ethiopia</option>
                    {/* Add more countries */}
                  </select>
                </div>
              </div>

              {/* Child Photo */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {t.upload_photo} <span className='text-red-500'>*</span>
                </label>
                <PhotoUploadWithCrop
                  formId={`child-${index}`}
                  personType='child'
                  required
                  currentPhoto={
                    child.photo && typeof child.photo === 'object'
                      ? child.photo.url
                      : undefined
                  }
                  onUploadSuccess={(result) => {
                    updateChild(index, 'photo', result);
                  }}
                  onUploadError={(error) => {
                    console.error(
                      `Child ${index + 1} photo upload error:`,
                      error
                    );
                    alert(`Child ${index + 1} photo upload failed: ` + error);
                  }}
                />
                {validationErrors[`child${index}Photo`] && (
                  <p className='mt-2 text-sm text-red-600'>
                    {validationErrors[`child${index}Photo`]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
        {t.review_title}
      </h2>
      <p className='text-gray-600 mb-8'>{t.review_subtitle}</p>

      {/* Personal Information Review */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>{t.personal_info_title}</h3>
          <button
            onClick={() => setCurrentStep(1)}
            className='text-blue-600 hover:text-blue-700 text-sm'
          >
            Edit
          </button>
        </div>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-600'>{t.first_name}:</p>
            <p className='font-medium'>
              {formData.personalInfo.firstName || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.last_name}:</p>
            <p className='font-medium'>
              {formData.personalInfo.lastName || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.middle_name}:</p>
            <p className='font-medium'>
              {formData.personalInfo.middleName || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.gender}:</p>
            <p className='font-medium'>
              {formData.personalInfo.gender
                ? t[formData.personalInfo.gender as keyof typeof t]
                : 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.birth_date}:</p>
            <p className='font-medium'>
              {formData.personalInfo.birthDate || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.birth_city}:</p>
            <p className='font-medium'>
              {formData.personalInfo.birthCity || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.birth_country}:</p>
            <p className='font-medium'>
              {formData.personalInfo.birthCountry || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.country_eligibility}:</p>
            <p className='font-medium'>
              {formData.personalInfo.countryOfEligibility || 'Not provided'}
            </p>
          </div>
        </div>
        {formData.personalInfo.photo && (
          <div className='mt-4'>
            <p className='text-gray-600 text-sm mb-2'>Photo:</p>
            <img
              src={formData.personalInfo.photo.url}
              alt='Applicant photo'
              className='w-24 h-24 object-cover rounded-lg border'
            />
          </div>
        )}
      </div>

      {/* Contact Information Review */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>{t.contact_info_title}</h3>
          <button
            onClick={() => setCurrentStep(2)}
            className='text-blue-600 hover:text-blue-700 text-sm'
          >
            Edit
          </button>
        </div>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-600'>{t.email_address}:</p>
            <p className='font-medium'>
              {formData.contactInfo.emailAddress || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.phone_number}:</p>
            <p className='font-medium'>
              {formData.contactInfo.phoneNumber || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.current_residence}:</p>
            <p className='font-medium'>
              {formData.contactInfo.countryOfResidence || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.mailing_address}:</p>
            <p className='font-medium'>
              {formData.contactInfo.mailingAddress || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Education & Work Review */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>{t.education_work_title}</h3>
          <button
            onClick={() => setCurrentStep(3)}
            className='text-blue-600 hover:text-blue-700 text-sm'
          >
            Edit
          </button>
        </div>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-600'>{t.education_level}:</p>
            <p className='font-medium'>
              {formData.educationWork.educationLevel
                ? t[
                    `education_${formData.educationWork.educationLevel}` as keyof typeof t
                  ]
                : 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.occupation}:</p>
            <p className='font-medium'>
              {formData.educationWork.occupation || 'Not provided'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>{t.employer}:</p>
            <p className='font-medium'>
              {formData.educationWork.employer || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Family Information Review */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>Family Information</h3>
          <button
            onClick={() => setCurrentStep(5)}
            className='text-blue-600 hover:text-blue-700 text-sm'
          >
            Edit
          </button>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-gray-600 text-sm'>{t.marital_status}:</p>
            <p className='font-medium'>
              {formData.maritalStatus
                ? t[formData.maritalStatus as keyof typeof t]
                : 'Not provided'}
            </p>
          </div>

          {formData.maritalStatus === 'married' && (
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-2'>
                {t.spouse_info_title}
              </h4>
              <div className='grid md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-600'>Name:</p>
                  <p className='font-medium'>
                    {`${formData.spouseInfo.firstName} ${formData.spouseInfo.middleName} ${formData.spouseInfo.lastName}`.trim() ||
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>{t.gender}:</p>
                  <p className='font-medium'>
                    {formData.spouseInfo.gender
                      ? t[formData.spouseInfo.gender as keyof typeof t]
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>{t.birth_date}:</p>
                  <p className='font-medium'>
                    {formData.spouseInfo.birthDate || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>{t.birth_city}:</p>
                  <p className='font-medium'>
                    {formData.spouseInfo.birthCity || 'Not provided'}
                  </p>
                </div>
              </div>
              {formData.spouseInfo.photo && (
                <div className='mt-2'>
                  <img
                    src={formData.spouseInfo.photo.url}
                    alt='Spouse photo'
                    className='w-16 h-16 object-cover rounded-lg border'
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <p className='text-gray-600 text-sm'>{t.number_children}:</p>
            <p className='font-medium'>{formData.numberOfChildren}</p>
          </div>

          {formData.children.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-medium text-gray-900'>{t.children_title}</h4>
              {formData.children.map((child, index) => (
                <div key={index} className='bg-gray-50 p-4 rounded-lg'>
                  <h5 className='font-medium text-gray-800 mb-2'>
                    {t.child_info.replace('{number}', (index + 1).toString())}
                  </h5>
                  <div className='grid md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-600'>Name:</p>
                      <p className='font-medium'>
                        {`${child.firstName} ${child.middleName} ${child.lastName}`.trim() ||
                          'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>{t.gender}:</p>
                      <p className='font-medium'>
                        {child.gender
                          ? t[child.gender as keyof typeof t]
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>{t.birth_date}:</p>
                      <p className='font-medium'>
                        {child.birthDate || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>{t.birth_city}:</p>
                      <p className='font-medium'>
                        {child.birthCity || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  {child.photo && (
                    <div className='mt-2'>
                      <img
                        src={child.photo.url}
                        alt={`Child ${index + 1} photo`}
                        className='w-16 h-16 object-cover rounded-lg border'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Final Confirmation */}
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-yellow-800'>
              Important Notice
            </h3>
            <div className='mt-2 text-sm text-yellow-700'>
              <p>
                Please review all information carefully. Once submitted, you
                cannot make changes to your application. Make sure all photos
                meet the requirements and all information is accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        // Save form data and redirect URL for after login
        localStorage.setItem('pending_form_submission', JSON.stringify({
          formData,
          returnUrl: `/${locale}/apply`,
          timestamp: Date.now()
        }));
        alert('Please log in first to submit an application.');
        window.location.href = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/apply`)}`;
        return;
      }

      // Map form values to backend expected format
      const mapGender = (gender: string) => {
        return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender;
      };

      const mapMaritalStatus = (status: string) => {
        switch (status) {
          case 'unmarried':
          case 'single':
            return 'Single';
          case 'married':
            return 'Married';
          case 'divorced':
          case 'widowed':
          case 'legally_separated':
            return 'Single'; // Backend only accepts Single or Married
          default:
            return status;
        }
      };

      // Prepare comprehensive form data
      const submissionData = {
        applicant_data: {
          first_name: formData.personalInfo.firstName,
          middle_name: formData.personalInfo.middleName,
          last_name: formData.personalInfo.lastName,
          gender: mapGender(formData.personalInfo.gender),
          date_of_birth: formData.personalInfo.birthDate,
          place_of_birth: formData.personalInfo.birthCity,
          country_of_birth: formData.personalInfo.birthCountry,
          country_of_eligibility: formData.personalInfo.countryOfEligibility,
          email: formData.contactInfo.emailAddress,
          phone: formData.contactInfo.phoneNumber || formData.contactInfo.emailAddress, // Phone is required by backend
          address: formData.contactInfo.mailingAddress || 'Not provided', // Address is required by backend
          city: formData.contactInfo.mailingCity,
          state: formData.contactInfo.mailingState,
          postal_code: formData.contactInfo.mailingPostalCode,
          country_of_residence: formData.contactInfo.countryOfResidence,
          education_level: formData.educationWork.educationLevel,
          occupation: formData.educationWork.occupation,
          employer: formData.educationWork.employer,
          marital_status: mapMaritalStatus(formData.maritalStatus),
        },
        family_members: [
          ...(formData.maritalStatus === 'married' && formData.spouseInfo.firstName
            ? [{
                relationship_type: 'spouse' as const,
                first_name: formData.spouseInfo.firstName,
                middle_name: formData.spouseInfo.middleName,
                last_name: formData.spouseInfo.lastName,
                gender: mapGender(formData.spouseInfo.gender),
                date_of_birth: formData.spouseInfo.birthDate,
                place_of_birth: formData.spouseInfo.birthCity,
                country_of_birth: formData.spouseInfo.birthCountry,
              }]
            : []),
          ...formData.children.map((child) => ({
            relationship_type: 'child' as const,
            first_name: child.firstName,
            middle_name: child.middleName,
            last_name: child.lastName,
            gender: mapGender(child.gender),
            date_of_birth: child.birthDate,
            place_of_birth: child.birthCity,
            country_of_birth: child.birthCountry,
          })),
        ],
        photos: [
          formData.personalInfo.photo?.url,
          ...(formData.maritalStatus === 'married'
            ? [formData.spouseInfo.photo?.url]
            : []),
          ...formData.children.map((child) => child.photo?.url),
        ].filter(Boolean),
      };

      const response = await fetch('/api/user/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Form submission failed');
      }

      if (result.success) {
        // Clear saved form data on successful submission
        localStorage.removeItem('dv_form_draft');
        localStorage.removeItem('dv_form_step');
        localStorage.removeItem('pending_form_submission');
        
        alert(
          `${t.success_title}\n${t.confirmation_number}: ${result.form_id}`
        );
        window.location.href = `/${locale}/dashboard`;
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error submitting form. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderContactInfoStep();
      case 3:
        return renderEducationWorkStep();
      case 4:
        return renderPhotoUploadStep();
      case 5:
        return renderFamilyStep();
      case 6:
        return renderReviewStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link
            href={`/${locale}`}
            className='text-blue-600 hover:text-blue-700 mb-4 inline-block'
          >
            <ChevronLeftIcon className='w-5 h-5 inline mr-1' />
            {t.back_home}
          </Link>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
            {t.title}
          </h1>
          <p className='text-lg text-gray-600 mb-6'>{t.subtitle}</p>
          {/* Auto-save indicator */}
          {isAutoSaving && (
            <div className='inline-flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full'>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Auto-saving...
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Form */}
        <div className='bg-white rounded-lg shadow-md p-6 md:p-8'>
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className='flex justify-between items-center pt-8 mt-8 border-t border-gray-200'>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className='flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <ChevronLeftIcon className='w-5 h-5 mr-2' />
              {t.previous}
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors'
              >
                {isSubmitting ? 'Processing...' : t.submit}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className='flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors'
              >
                {t.next}
                <ChevronRightIcon className='w-5 h-5 ml-2' />
              </button>
            )}
          </div>

          {/* Validation Error Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <h4 className='text-sm font-medium text-red-800 mb-2'>
                Please fix the following errors:
              </h4>
              <ul className='text-sm text-red-700 space-y-1'>
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
