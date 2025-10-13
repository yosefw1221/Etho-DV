import { 
  validatePersonalInfo, 
  validateContactInfo, 
  validateBackgroundInfo, 
  validateFamilyInfo,
  validatePhotoUpload,
  validateBusinessRules,
  validateCompleteForm,
  validateField
} from '../validation';
import { DVFormData } from '@/types/form';

// Mock data for testing
const mockFormData: DVFormData = {
  personal_info: {
    first_name: 'John',
    middle_name: 'Michael',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    place_of_birth: 'Addis Ababa',
    gender: 'Male',
    country_of_birth: 'Ethiopia',
    country_of_eligibility: 'Ethiopia'
  },
  contact_info: {
    address: '123 Main Street, Addis Ababa, Ethiopia',
    phone: '+251912345678',
    email: 'john.doe@example.com',
    passport_number: 'ET1234567',
    passport_expiry: '2025-12-31'
  },
  background_info: {
    education_level: 'university_degree',
    occupation: 'Software Engineer',
    marital_status: 'Single'
  },
  family_members: [],
  number_of_children: 0,
  current_step: 1,
  is_complete: false
};

describe('Validation Functions', () => {
  describe('validatePersonalInfo', () => {
    it('should validate correct personal information', () => {
      const result = validatePersonalInfo(mockFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid first name', () => {
      const invalidData = {
        ...mockFormData,
        personal_info: {
          ...mockFormData.personal_info,
          first_name: 'A' // Too short
        }
      };
      const result = validatePersonalInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'first_name')).toBe(true);
    });

    it('should reject future birth date', () => {
      const invalidData = {
        ...mockFormData,
        personal_info: {
          ...mockFormData.personal_info,
          date_of_birth: '2030-01-01' // Future date
        }
      };
      const result = validatePersonalInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'date_of_birth')).toBe(true);
    });

    it('should reject underage applicant', () => {
      const invalidData = {
        ...mockFormData,
        personal_info: {
          ...mockFormData.personal_info,
          date_of_birth: '2010-01-01' // Under 18
        }
      };
      const result = validatePersonalInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'date_of_birth')).toBe(true);
    });
  });

  describe('validateContactInfo', () => {
    it('should validate correct contact information', () => {
      const result = validateContactInfo(mockFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...mockFormData,
        contact_info: {
          ...mockFormData.contact_info,
          email: 'invalid-email'
        }
      };
      const result = validateContactInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        ...mockFormData,
        contact_info: {
          ...mockFormData.contact_info,
          phone: '123' // Too short
        }
      };
      const result = validateContactInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'phone')).toBe(true);
    });

    it('should reject expired passport', () => {
      const invalidData = {
        ...mockFormData,
        contact_info: {
          ...mockFormData.contact_info,
          passport_expiry: '2020-01-01' // Expired
        }
      };
      const result = validateContactInfo(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'passport_expiry')).toBe(true);
    });
  });

  describe('validateField', () => {
    it('should validate name fields correctly', () => {
      const result = validateField('first_name', 'John');
      expect(result).toBeNull(); // No error

      const invalidResult = validateField('first_name', 'A');
      expect(invalidResult).not.toBeNull();
      expect(invalidResult?.message).toContain('at least 2 characters');
    });

    it('should validate email fields correctly', () => {
      const result = validateField('email', 'test@example.com');
      expect(result).toBeNull(); // No error

      const invalidResult = validateField('email', 'invalid-email');
      expect(invalidResult).not.toBeNull();
      expect(invalidResult?.message).toContain('valid email');
    });

    it('should validate phone fields correctly', () => {
      const result = validateField('phone', '+251912345678');
      expect(result).toBeNull(); // No error

      const invalidResult = validateField('phone', '123');
      expect(invalidResult).not.toBeNull();
      expect(invalidResult?.message).toContain('valid phone number');
    });
  });

  describe('validateBusinessRules', () => {
    it('should validate business rules for single applicant', () => {
      const result = validateBusinessRules(mockFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require work experience for low education', () => {
      const invalidData = {
        ...mockFormData,
        background_info: {
          ...mockFormData.background_info,
          education_level: 'primary_only',
          occupation: '' // No occupation
        }
      };
      const result = validateBusinessRules(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'occupation')).toBe(true);
    });

    it('should validate family member limits', () => {
      const invalidData = {
        ...mockFormData,
        family_members: Array(11).fill(null).map((_, i) => ({
          id: `child-${i}`,
          relationship_type: 'child' as const,
          first_name: `Child${i}`,
          last_name: 'Test',
          date_of_birth: '2010-01-01',
          place_of_birth: 'Addis Ababa',
          gender: 'Male' as const,
          country_of_birth: 'Ethiopia'
        }))
      };
      const result = validateBusinessRules(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Maximum 10 family members'))).toBe(true);
    });
  });

  describe('validateCompleteForm', () => {
    it('should validate complete form successfully', () => {
      const result = validateCompleteForm(mockFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch all validation errors', () => {
      const invalidData = {
        ...mockFormData,
        personal_info: {
          ...mockFormData.personal_info,
          first_name: '', // Invalid
          date_of_birth: '2030-01-01' // Future date
        },
        contact_info: {
          ...mockFormData.contact_info,
          email: 'invalid-email' // Invalid
        }
      };
      const result = validateCompleteForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
