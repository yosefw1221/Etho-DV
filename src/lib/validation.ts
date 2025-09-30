import { DVFormData, ValidationError, FormValidation } from '@/types/form';
import { calculateAge } from '@/lib/utils';

export function validatePersonalInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { personal_info } = data;

  if (!personal_info.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!personal_info.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (!personal_info.date_of_birth) {
    errors.push({ field: 'date_of_birth', message: 'Date of birth is required' });
  } else {
    const birthDate = new Date(personal_info.date_of_birth);
    const age = calculateAge(birthDate);
    
    if (age < 18) {
      errors.push({ field: 'date_of_birth', message: 'Must be at least 18 years old' });
    }
    
    if (age > 100) {
      errors.push({ field: 'date_of_birth', message: 'Please enter a valid birth date' });
    }
  }

  if (!personal_info.place_of_birth?.trim()) {
    errors.push({ field: 'place_of_birth', message: 'Place of birth is required' });
  }

  if (!personal_info.gender) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  }

  if (!personal_info.country_of_birth?.trim()) {
    errors.push({ field: 'country_of_birth', message: 'Country of birth is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateContactInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { contact_info } = data;

  if (!contact_info.address?.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  }

  if (!contact_info.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!/^\+?[\d\s\-()]{8,}$/.test(contact_info.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!contact_info.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_info.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!contact_info.passport_number?.trim()) {
    errors.push({ field: 'passport_number', message: 'Passport number is required' });
  }

  if (!contact_info.passport_expiry) {
    errors.push({ field: 'passport_expiry', message: 'Passport expiry date is required' });
  } else {
    const expiryDate = new Date(contact_info.passport_expiry);
    const today = new Date();
    
    if (expiryDate <= today) {
      errors.push({ field: 'passport_expiry', message: 'Passport must not be expired' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBackgroundInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { background_info } = data;

  if (!background_info.education_level) {
    errors.push({ field: 'education_level', message: 'Education level is required' });
  }

  if (!background_info.marital_status) {
    errors.push({ field: 'marital_status', message: 'Marital status is required' });
  }

  if (!background_info.photo) {
    errors.push({ field: 'photo', message: 'Photo is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateFamilyMember(member: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `family_${member.id}`;

  if (!member.first_name?.trim()) {
    errors.push({ field: `${prefix}_first_name`, message: 'First name is required' });
  }

  if (!member.last_name?.trim()) {
    errors.push({ field: `${prefix}_last_name`, message: 'Last name is required' });
  }

  if (!member.date_of_birth) {
    errors.push({ field: `${prefix}_date_of_birth`, message: 'Date of birth is required' });
  } else {
    const birthDate = new Date(member.date_of_birth);
    const age = calculateAge(birthDate);
    
    if (member.relationship_type === 'child' && age >= 21) {
      errors.push({ 
        field: `${prefix}_date_of_birth`, 
        message: 'Children must be under 21 years old' 
      });
    }
  }

  if (!member.place_of_birth?.trim()) {
    errors.push({ field: `${prefix}_place_of_birth`, message: 'Place of birth is required' });
  }

  if (!member.gender) {
    errors.push({ field: `${prefix}_gender`, message: 'Gender is required' });
  }

  if (!member.country_of_birth?.trim()) {
    errors.push({ field: `${prefix}_country_of_birth`, message: 'Country of birth is required' });
  }

  if (!member.photo) {
    errors.push({ field: `${prefix}_photo`, message: 'Photo is required' });
  }

  return errors;
}

export function validateFamilyInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { background_info, family_members } = data;

  // If married, must have spouse
  if (background_info.marital_status === 'Married') {
    const hasSpouse = family_members.some(member => member.relationship_type === 'spouse');
    if (!hasSpouse) {
      errors.push({ 
        field: 'family_members', 
        message: 'Spouse information is required for married applicants' 
      });
    }
  }

  // Validate each family member
  family_members.forEach(member => {
    const memberErrors = validateFamilyMember(member);
    errors.push(...memberErrors);
  });

  // Check for multiple spouses
  const spouseCount = family_members.filter(member => member.relationship_type === 'spouse').length;
  if (spouseCount > 1) {
    errors.push({ 
      field: 'family_members', 
      message: 'Only one spouse is allowed' 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCompleteForm(data: DVFormData): FormValidation {
  const personalValidation = validatePersonalInfo(data);
  const contactValidation = validateContactInfo(data);
  const backgroundValidation = validateBackgroundInfo(data);
  const familyValidation = validateFamilyInfo(data);

  const allErrors = [
    ...personalValidation.errors,
    ...contactValidation.errors,
    ...backgroundValidation.errors,
    ...familyValidation.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}