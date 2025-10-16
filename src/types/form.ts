export interface PersonalInfo {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  gender: 'Male' | 'Female' | '';
  country_of_birth: string;
  country_of_eligibility?: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  // passport_number: string;
  // passport_expiry: string;
}

export interface PhotoData {
  name: string;
  url: string;
  size: number;
}

export interface BackgroundInfo {
  education_level: string;
  occupation?: string;
  marital_status: 'Single' | 'Married' | '';
  photo?: File | PhotoData;
}

export interface FamilyMember {
  id: string;
  relationship_type: 'spouse' | 'child';
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  gender: 'Male' | 'Female' | '';
  country_of_birth: string;
  // passport_number?: string;
  // passport_expiry?: string;
  photo?: File;
}

export interface DVFormData {
  personal_info: PersonalInfo;
  contact_info: ContactInfo;
  background_info: BackgroundInfo;
  family_members: FamilyMember[];
  number_of_children: number;
  current_step: number;
  is_complete: boolean;
}

export interface FormStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  isValid: (data: DVFormData) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export const EDUCATION_LEVELS = [
  { value: '', label: 'Select Education Level' },
  { value: 'primary_only', label: 'Primary school only' },
  { value: 'high_school_no_degree', label: 'High school, no degree' },
  { value: 'high_school_degree', label: 'High school degree' },
  { value: 'vocational_school', label: 'Vocational school' },
  { value: 'some_university', label: 'Some university courses' },
  { value: 'university_degree', label: 'University degree' },
  { value: 'some_graduate', label: 'Some graduate level courses' },
  { value: 'masters_degree', label: "Master's degree" },
  { value: 'some_doctorate', label: 'Some doctorate level courses' },
  { value: 'doctorate_degree', label: 'Doctorate degree' },
];

export const COUNTRIES = [
  { value: '', label: 'Select Country' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Eritrea', label: 'Eritrea' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Sudan', label: 'Sudan' },
  { value: 'Somalia', label: 'Somalia' },
  // Add more countries as needed
];
