import { DVFormData, ValidationError, FormValidation } from '@/types/form';
import { calculateAge, validateEmail, validatePhone } from '@/lib/utils';

export function validatePersonalInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { personal_info } = data;

  // First name validation
  if (!personal_info.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  } else if (personal_info.first_name.trim().length < 2) {
    errors.push({ field: 'first_name', message: 'First name must be at least 2 characters long' });
  } else if (personal_info.first_name.trim().length > 50) {
    errors.push({ field: 'first_name', message: 'First name cannot exceed 50 characters' });
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(personal_info.first_name.trim())) {
    errors.push({ field: 'first_name', message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods' });
  }

  // Middle name validation (optional)
  if (personal_info.middle_name && personal_info.middle_name.trim()) {
    if (personal_info.middle_name.trim().length > 50) {
      errors.push({ field: 'middle_name', message: 'Middle name cannot exceed 50 characters' });
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(personal_info.middle_name.trim())) {
      errors.push({ field: 'middle_name', message: 'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods' });
    }
  }

  // Last name validation
  if (!personal_info.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  } else if (personal_info.last_name.trim().length < 2) {
    errors.push({ field: 'last_name', message: 'Last name must be at least 2 characters long' });
  } else if (personal_info.last_name.trim().length > 50) {
    errors.push({ field: 'last_name', message: 'Last name cannot exceed 50 characters' });
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(personal_info.last_name.trim())) {
    errors.push({ field: 'last_name', message: 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods' });
  }

  // Date of birth validation
  if (!personal_info.date_of_birth) {
    errors.push({ field: 'date_of_birth', message: 'Date of birth is required' });
  } else {
    const birthDate = new Date(personal_info.date_of_birth);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      errors.push({ field: 'date_of_birth', message: 'Please enter a valid date' });
    } else {
      // Check if date is in the future
      if (birthDate > today) {
        errors.push({ field: 'date_of_birth', message: 'Date of birth cannot be in the future' });
      } else {
        const age = calculateAge(birthDate);
        
        // DV lottery age requirements
        if (age < 18) {
          errors.push({ field: 'date_of_birth', message: 'Must be at least 18 years old to apply for DV lottery' });
        }
        
        if (age > 100) {
          errors.push({ field: 'date_of_birth', message: 'Please enter a valid birth date' });
        }
      }
    }
  }

  // Place of birth validation
  if (!personal_info.place_of_birth?.trim()) {
    errors.push({ field: 'place_of_birth', message: 'Place of birth is required' });
  } else if (personal_info.place_of_birth.trim().length < 2) {
    errors.push({ field: 'place_of_birth', message: 'Place of birth must be at least 2 characters long' });
  } else if (personal_info.place_of_birth.trim().length > 100) {
    errors.push({ field: 'place_of_birth', message: 'Place of birth cannot exceed 100 characters' });
  }

  // Gender validation
  if (!personal_info.gender) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  } else if (!['Male', 'Female'].includes(personal_info.gender)) {
    errors.push({ field: 'gender', message: 'Please select a valid gender' });
  }

  // Country of birth validation
  if (!personal_info.country_of_birth?.trim()) {
    errors.push({ field: 'country_of_birth', message: 'Country of birth is required' });
  } else if (personal_info.country_of_birth.trim().length < 2) {
    errors.push({ field: 'country_of_birth', message: 'Please enter a valid country name' });
  }

  // Country of eligibility validation (optional)
  if (personal_info.country_of_eligibility && personal_info.country_of_eligibility.trim()) {
    if (personal_info.country_of_eligibility.trim().length < 2) {
      errors.push({ field: 'country_of_eligibility', message: 'Please enter a valid country name' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateContactInfo(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { contact_info } = data;

  // Address validation
  if (!contact_info.address?.trim()) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (contact_info.address.trim().length < 10) {
    errors.push({ field: 'address', message: 'Address must be at least 10 characters long' });
  } else if (contact_info.address.trim().length > 200) {
    errors.push({ field: 'address', message: 'Address cannot exceed 200 characters' });
  }

  // Phone validation
  if (!contact_info.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else {
    const phone = contact_info.phone.trim();
    
    // Ethiopian phone number validation
    const ethiopianPhoneRegex = /^(\+251|251|0)?[97]\d{8}$/;
    const internationalPhoneRegex = /^\+[1-9]\d{1,14}$/;
    
    if (!ethiopianPhoneRegex.test(phone.replace(/\s/g, '')) && !internationalPhoneRegex.test(phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number (e.g., +251912345678 or 0912345678)' });
    }
  }

  // Email validation
  if (!contact_info.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(contact_info.email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (contact_info.email.trim().length > 100) {
    errors.push({ field: 'email', message: 'Email cannot exceed 100 characters' });
  }

  // Passport number validation
  if (!contact_info.passport_number?.trim()) {
    errors.push({ field: 'passport_number', message: 'Passport number is required' });
  } else {
    const passportNumber = contact_info.passport_number.trim().toUpperCase();
    
    if (passportNumber.length < 6) {
      errors.push({ field: 'passport_number', message: 'Passport number must be at least 6 characters long' });
    } else if (passportNumber.length > 20) {
      errors.push({ field: 'passport_number', message: 'Passport number cannot exceed 20 characters' });
    } else if (!/^[A-Z0-9]+$/.test(passportNumber)) {
      errors.push({ field: 'passport_number', message: 'Passport number can only contain letters and numbers' });
    }
  }

  // Passport expiry validation
  if (!contact_info.passport_expiry) {
    errors.push({ field: 'passport_expiry', message: 'Passport expiry date is required' });
  } else {
    const expiryDate = new Date(contact_info.passport_expiry);
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    // Check if date is valid
    if (isNaN(expiryDate.getTime())) {
      errors.push({ field: 'passport_expiry', message: 'Please enter a valid expiry date' });
    } else {
      // Check if passport is expired
      if (expiryDate <= today) {
        errors.push({ field: 'passport_expiry', message: 'Passport must not be expired' });
      }
      // Check if passport expires within 6 months (warning)
      else if (expiryDate <= sixMonthsFromNow) {
        errors.push({ field: 'passport_expiry', message: 'Passport expires within 6 months. Consider renewing before travel.' });
      }
      // Check if expiry date is too far in the future (more than 10 years)
      else {
        const tenYearsFromNow = new Date();
        tenYearsFromNow.setFullYear(today.getFullYear() + 10);
        if (expiryDate > tenYearsFromNow) {
          errors.push({ field: 'passport_expiry', message: 'Please enter a valid passport expiry date' });
        }
      }
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

  // Education level validation
  if (!background_info.education_level) {
    errors.push({ field: 'education_level', message: 'Education level is required' });
  } else {
    const validEducationLevels = [
      'primary_only',
      'high_school_no_degree',
      'high_school_degree',
      'vocational_school',
      'some_university',
      'university_degree',
      'some_graduate',
      'masters_degree',
      'some_doctorate',
      'doctorate_degree'
    ];
    
    if (!validEducationLevels.includes(background_info.education_level)) {
      errors.push({ field: 'education_level', message: 'Please select a valid education level' });
    }
  }

  // Occupation validation (optional but if provided, should be valid)
  if (background_info.occupation && background_info.occupation.trim()) {
    if (background_info.occupation.trim().length < 2) {
      errors.push({ field: 'occupation', message: 'Occupation must be at least 2 characters long' });
    } else if (background_info.occupation.trim().length > 100) {
      errors.push({ field: 'occupation', message: 'Occupation cannot exceed 100 characters' });
    } else if (!/^[a-zA-Z\s\-'\.&,]+$/.test(background_info.occupation.trim())) {
      errors.push({ field: 'occupation', message: 'Occupation can only contain letters, spaces, hyphens, apostrophes, periods, ampersands, and commas' });
    }
  }

  // Marital status validation
  if (!background_info.marital_status) {
    errors.push({ field: 'marital_status', message: 'Marital status is required' });
  } else if (!['Single', 'Married'].includes(background_info.marital_status)) {
    errors.push({ field: 'marital_status', message: 'Please select a valid marital status' });
  }

  // Note: Photo validation is now handled in a separate step (step 4)

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateFamilyMember(member: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `family_${member.id}`;

  // First name validation
  if (!member.first_name?.trim()) {
    errors.push({ field: `${prefix}_first_name`, message: 'First name is required' });
  } else if (member.first_name.trim().length < 2) {
    errors.push({ field: `${prefix}_first_name`, message: 'First name must be at least 2 characters long' });
  } else if (member.first_name.trim().length > 50) {
    errors.push({ field: `${prefix}_first_name`, message: 'First name cannot exceed 50 characters' });
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(member.first_name.trim())) {
    errors.push({ field: `${prefix}_first_name`, message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods' });
  }

  // Middle name validation (optional)
  if (member.middle_name && member.middle_name.trim()) {
    if (member.middle_name.trim().length > 50) {
      errors.push({ field: `${prefix}_middle_name`, message: 'Middle name cannot exceed 50 characters' });
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(member.middle_name.trim())) {
      errors.push({ field: `${prefix}_middle_name`, message: 'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods' });
    }
  }

  // Last name validation
  if (!member.last_name?.trim()) {
    errors.push({ field: `${prefix}_last_name`, message: 'Last name is required' });
  } else if (member.last_name.trim().length < 2) {
    errors.push({ field: `${prefix}_last_name`, message: 'Last name must be at least 2 characters long' });
  } else if (member.last_name.trim().length > 50) {
    errors.push({ field: `${prefix}_last_name`, message: 'Last name cannot exceed 50 characters' });
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(member.last_name.trim())) {
    errors.push({ field: `${prefix}_last_name`, message: 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods' });
  }

  // Date of birth validation
  if (!member.date_of_birth) {
    errors.push({ field: `${prefix}_date_of_birth`, message: 'Date of birth is required' });
  } else {
    const birthDate = new Date(member.date_of_birth);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      errors.push({ field: `${prefix}_date_of_birth`, message: 'Please enter a valid date' });
    } else {
      // Check if date is in the future
      if (birthDate > today) {
        errors.push({ field: `${prefix}_date_of_birth`, message: 'Date of birth cannot be in the future' });
      } else {
        const age = calculateAge(birthDate);
        
        // DV lottery specific age requirements
        if (member.relationship_type === 'child' && age >= 21) {
          errors.push({ 
            field: `${prefix}_date_of_birth`, 
            message: 'Children must be under 21 years old to be included in DV application' 
          });
        }
        
        // Check for reasonable age limits
        if (age > 100) {
          errors.push({ field: `${prefix}_date_of_birth`, message: 'Please enter a valid birth date' });
        }
        
        // Spouse age validation (should be reasonable)
        if (member.relationship_type === 'spouse' && age < 16) {
          errors.push({ 
            field: `${prefix}_date_of_birth`, 
            message: 'Spouse must be at least 16 years old' 
          });
        }
      }
    }
  }

  // Place of birth validation
  if (!member.place_of_birth?.trim()) {
    errors.push({ field: `${prefix}_place_of_birth`, message: 'Place of birth is required' });
  } else if (member.place_of_birth.trim().length < 2) {
    errors.push({ field: `${prefix}_place_of_birth`, message: 'Place of birth must be at least 2 characters long' });
  } else if (member.place_of_birth.trim().length > 100) {
    errors.push({ field: `${prefix}_place_of_birth`, message: 'Place of birth cannot exceed 100 characters' });
  }

  // Gender validation
  if (!member.gender) {
    errors.push({ field: `${prefix}_gender`, message: 'Gender is required' });
  } else if (!['Male', 'Female'].includes(member.gender)) {
    errors.push({ field: `${prefix}_gender`, message: 'Please select a valid gender' });
  }

  // Country of birth validation
  if (!member.country_of_birth?.trim()) {
    errors.push({ field: `${prefix}_country_of_birth`, message: 'Country of birth is required' });
  } else if (member.country_of_birth.trim().length < 2) {
    errors.push({ field: `${prefix}_country_of_birth`, message: 'Please enter a valid country name' });
  }

  // Passport validation (optional for family members)
  if (member.passport_number && member.passport_number.trim()) {
    const passportNumber = member.passport_number.trim().toUpperCase();
    
    if (passportNumber.length < 6) {
      errors.push({ field: `${prefix}_passport_number`, message: 'Passport number must be at least 6 characters long' });
    } else if (passportNumber.length > 20) {
      errors.push({ field: `${prefix}_passport_number`, message: 'Passport number cannot exceed 20 characters' });
    } else if (!/^[A-Z0-9]+$/.test(passportNumber)) {
      errors.push({ field: `${prefix}_passport_number`, message: 'Passport number can only contain letters and numbers' });
    }
  }

  if (member.passport_expiry && member.passport_expiry.trim()) {
    const expiryDate = new Date(member.passport_expiry);
    const today = new Date();
    
    if (isNaN(expiryDate.getTime())) {
      errors.push({ field: `${prefix}_passport_expiry`, message: 'Please enter a valid expiry date' });
    } else if (expiryDate <= today) {
      errors.push({ field: `${prefix}_passport_expiry`, message: 'Passport must not be expired' });
    }
  }

  // Photo validation
  if (!member.photo) {
    errors.push({ field: `${prefix}_photo`, message: 'Photo is required for all family members' });
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

export function validatePhotoUpload(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];

  const photo = data.background_info.photo;

  // Check if photo exists
  if (!photo) {
    errors.push({ field: 'photo', message: 'Photo is required for the primary applicant' });
  } else {
    // Check if photo is PhotoData type and has url
    if (typeof photo === 'object' && 'url' in photo) {
      if (!photo.url) {
        errors.push({ field: 'photo', message: 'Photo upload failed. Please try again.' });
      } else if (photo.size && photo.size > 240000) { // 240KB limit
        errors.push({ field: 'photo', message: 'Photo size must be less than 240KB' });
      }
    }
    // Check if photo is File type
    else if (photo instanceof File) {
      if (photo.size === 0) {
        errors.push({ field: 'photo', message: 'Photo file is empty. Please select a valid photo.' });
      } else if (photo.size > 240000) { // 240KB limit
        errors.push({ field: 'photo', message: 'Photo size must be less than 240KB' });
      } else if (!photo.type.match(/^image\/(jpeg|jpg)$/)) {
        errors.push({ field: 'photo', message: 'Photo must be in JPEG format' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Business rules validation
export function validateBusinessRules(data: DVFormData): FormValidation {
  const errors: ValidationError[] = [];
  const { personal_info, background_info, family_members } = data;

  // DV Lottery specific business rules
  
  // Rule 1: Education requirement check
  if (background_info.education_level) {
    const lowEducationLevels = ['primary_only', 'high_school_no_degree'];
    if (lowEducationLevels.includes(background_info.education_level)) {
      // For low education, check if they have work experience
      if (!background_info.occupation || background_info.occupation.trim() === '') {
        errors.push({ 
          field: 'occupation', 
          message: 'Work experience is required for applicants with primary or incomplete high school education' 
        });
      }
    }
  }

  // Rule 2: Family member limits
  const totalFamilyMembers = family_members.length;
  if (totalFamilyMembers > 10) {
    errors.push({ 
      field: 'family_members', 
      message: 'Maximum 10 family members allowed per application' 
    });
  }

  // Rule 3: Child age validation for DV lottery
  const children = family_members.filter(member => member.relationship_type === 'child');
  children.forEach((child, index) => {
    if (child.date_of_birth) {
      const birthDate = new Date(child.date_of_birth);
      const age = calculateAge(birthDate);
      
      // Children must be unmarried and under 21
      if (age >= 21) {
        errors.push({ 
          field: `family_${child.id}_date_of_birth`, 
          message: `Child ${index + 1} is 21 or older and cannot be included in DV application` 
        });
      }
    }
  });

  // Rule 4: Spouse validation
  const spouses = family_members.filter(member => member.relationship_type === 'spouse');
  if (spouses.length > 1) {
    errors.push({ 
      field: 'family_members', 
      message: 'Only one spouse is allowed per application' 
    });
  }

  // Rule 5: Marital status consistency
  if (background_info.marital_status === 'Married' && spouses.length === 0) {
    errors.push({ 
      field: 'family_members', 
      message: 'Spouse information is required for married applicants' 
    });
  }

  if (background_info.marital_status === 'Single' && spouses.length > 0) {
    errors.push({ 
      field: 'family_members', 
      message: 'Spouse information should not be provided for single applicants' 
    });
  }

  // Rule 6: Country eligibility validation
  const eligibleCountries = [
    'Ethiopia', 'Eritrea', 'Kenya', 'Sudan', 'Somalia', 'Djibouti', 
    'South Sudan', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi'
  ];
  
  if (personal_info.country_of_birth && !eligibleCountries.includes(personal_info.country_of_birth)) {
    errors.push({ 
      field: 'country_of_birth', 
      message: 'Country of birth must be from an eligible DV lottery country' 
    });
  }

  // Rule 7: Duplicate family member names
  const allNames = [
    `${personal_info.first_name} ${personal_info.last_name}`.toLowerCase(),
    ...family_members.map(member => `${member.first_name} ${member.last_name}`.toLowerCase())
  ];
  
  const duplicateNames = allNames.filter((name, index) => allNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push({ 
      field: 'family_members', 
      message: 'Duplicate names found. Each family member must have a unique name.' 
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
  const photoValidation = validatePhotoUpload(data);
  const familyValidation = validateFamilyInfo(data);
  const businessRulesValidation = validateBusinessRules(data);

  const allErrors = [
    ...personalValidation.errors,
    ...contactValidation.errors,
    ...backgroundValidation.errors,
    ...photoValidation.errors,
    ...familyValidation.errors,
    ...businessRulesValidation.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Real-time validation utilities for client-side validation
export function validateField(fieldName: string, value: string, fieldType: string = 'text'): ValidationError | null {
  const trimmedValue = value?.trim() || '';

  switch (fieldName) {
    case 'first_name':
    case 'last_name':
      if (!trimmedValue) {
        return { field: fieldName, message: `${fieldName.replace('_', ' ')} is required` };
      }
      if (trimmedValue.length < 2) {
        return { field: fieldName, message: `${fieldName.replace('_', ' ')} must be at least 2 characters long` };
      }
      if (trimmedValue.length > 50) {
        return { field: fieldName, message: `${fieldName.replace('_', ' ')} cannot exceed 50 characters` };
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedValue)) {
        return { field: fieldName, message: `${fieldName.replace('_', ' ')} can only contain letters, spaces, hyphens, apostrophes, and periods` };
      }
      break;

    case 'middle_name':
      if (trimmedValue && trimmedValue.length > 50) {
        return { field: fieldName, message: 'Middle name cannot exceed 50 characters' };
      }
      if (trimmedValue && !/^[a-zA-Z\s\-'\.]+$/.test(trimmedValue)) {
        return { field: fieldName, message: 'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods' };
      }
      break;

    case 'email':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Email is required' };
      }
      if (!validateEmail(trimmedValue)) {
        return { field: fieldName, message: 'Please enter a valid email address' };
      }
      if (trimmedValue.length > 100) {
        return { field: fieldName, message: 'Email cannot exceed 100 characters' };
      }
      break;

    case 'phone':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Phone number is required' };
      }
      const ethiopianPhoneRegex = /^(\+251|251|0)?[97]\d{8}$/;
      const internationalPhoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!ethiopianPhoneRegex.test(trimmedValue.replace(/\s/g, '')) && !internationalPhoneRegex.test(trimmedValue)) {
        return { field: fieldName, message: 'Please enter a valid phone number (e.g., +251912345678 or 0912345678)' };
      }
      break;

    case 'passport_number':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Passport number is required' };
      }
      const passportNumber = trimmedValue.toUpperCase();
      if (passportNumber.length < 6) {
        return { field: fieldName, message: 'Passport number must be at least 6 characters long' };
      }
      if (passportNumber.length > 20) {
        return { field: fieldName, message: 'Passport number cannot exceed 20 characters' };
      }
      if (!/^[A-Z0-9]+$/.test(passportNumber)) {
        return { field: fieldName, message: 'Passport number can only contain letters and numbers' };
      }
      break;

    case 'address':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Address is required' };
      }
      if (trimmedValue.length < 10) {
        return { field: fieldName, message: 'Address must be at least 10 characters long' };
      }
      if (trimmedValue.length > 200) {
        return { field: fieldName, message: 'Address cannot exceed 200 characters' };
      }
      break;

    case 'place_of_birth':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Place of birth is required' };
      }
      if (trimmedValue.length < 2) {
        return { field: fieldName, message: 'Place of birth must be at least 2 characters long' };
      }
      if (trimmedValue.length > 100) {
        return { field: fieldName, message: 'Place of birth cannot exceed 100 characters' };
      }
      break;

    case 'occupation':
      if (trimmedValue && trimmedValue.length < 2) {
        return { field: fieldName, message: 'Occupation must be at least 2 characters long' };
      }
      if (trimmedValue && trimmedValue.length > 100) {
        return { field: fieldName, message: 'Occupation cannot exceed 100 characters' };
      }
      if (trimmedValue && !/^[a-zA-Z\s\-'\.&,]+$/.test(trimmedValue)) {
        return { field: fieldName, message: 'Occupation can only contain letters, spaces, hyphens, apostrophes, periods, ampersands, and commas' };
      }
      break;

    case 'date_of_birth':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Date of birth is required' };
      }
      const birthDate = new Date(trimmedValue);
      if (isNaN(birthDate.getTime())) {
        return { field: fieldName, message: 'Please enter a valid date' };
      }
      if (birthDate > new Date()) {
        return { field: fieldName, message: 'Date of birth cannot be in the future' };
      }
      const age = calculateAge(birthDate);
      if (age < 18) {
        return { field: fieldName, message: 'Must be at least 18 years old to apply for DV lottery' };
      }
      if (age > 100) {
        return { field: fieldName, message: 'Please enter a valid birth date' };
      }
      break;

    case 'passport_expiry':
      if (!trimmedValue) {
        return { field: fieldName, message: 'Passport expiry date is required' };
      }
      const expiryDate = new Date(trimmedValue);
      if (isNaN(expiryDate.getTime())) {
        return { field: fieldName, message: 'Please enter a valid expiry date' };
      }
      if (expiryDate <= new Date()) {
        return { field: fieldName, message: 'Passport must not be expired' };
      }
      break;
  }

  return null;
}

// Validation for specific field types
export function validateNameField(value: string, fieldName: string): ValidationError | null {
  return validateField(fieldName, value, 'name');
}

export function validateEmailField(value: string): ValidationError | null {
  return validateField('email', value, 'email');
}

export function validatePhoneField(value: string): ValidationError | null {
  return validateField('phone', value, 'phone');
}

export function validateDateField(value: string, fieldName: string): ValidationError | null {
  return validateField(fieldName, value, 'date');
}