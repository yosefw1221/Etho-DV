import { NextRequest } from 'next/server';

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export class PhotoValidationMiddleware {
  /**
   * Validate photo file before processing
   */
  static async validatePhotoFile(file: File): Promise<PhotoValidationResult> {
    const warnings: string[] = [];

    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No photo file provided' };
    }

    // Check file type
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      return { valid: false, error: 'Photo must be in JPEG format' };
    }

    // Check file name extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
      return { valid: false, error: 'File must have .jpg or .jpeg extension' };
    }

    // Check file size (240KB max)
    const maxSize = 240 * 1024; // 240KB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size must be under 240KB (current: ${Math.round(file.size / 1024)}KB)` 
      };
    }

    // Warn if file is very small (might be low quality)
    const minRecommendedSize = 50 * 1024; // 50KB
    if (file.size < minRecommendedSize) {
      warnings.push(`File size is quite small (${Math.round(file.size / 1024)}KB). Ensure photo quality is adequate.`);
    }

    // Check file name for potential issues
    if (fileName.includes(' ')) {
      warnings.push('File name contains spaces. Consider using underscores or hyphens instead.');
    }

    return { valid: true, warnings };
  }

  /**
   * Validate image dimensions from File object
   */
  static async validateImageDimensions(file: File): Promise<PhotoValidationResult> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        const warnings: string[] = [];
        
        // DV photo requirements: 600x600 to 1200x1200 pixels, square
        if (width !== height) {
          resolve({ valid: false, error: 'Photo must be square (equal width and height)' });
          return;
        }
        
        if (width < 600 || height < 600) {
          resolve({ valid: false, error: 'Photo must be at least 600x600 pixels' });
          return;
        }
        
        if (width > 1200 || height > 1200) {
          resolve({ valid: false, error: 'Photo must not exceed 1200x1200 pixels' });
          return;
        }

        // Add warnings for non-optimal dimensions
        if (width < 800 || height < 800) {
          warnings.push('Photo resolution is on the lower end. Higher resolution (800x800 or more) is recommended.');
        }

        if (width > 1000 || height > 1000) {
          warnings.push('Photo resolution is quite high. Consider optimizing to reduce file size.');
        }
        
        resolve({ valid: true, warnings });
      };
      
      img.onerror = () => {
        resolve({ valid: false, error: 'Invalid image file or corrupted data' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Comprehensive photo validation combining all checks
   */
  static async validatePhoto(file: File): Promise<PhotoValidationResult> {
    // Basic file validation
    const fileValidation = await this.validatePhotoFile(file);
    if (!fileValidation.valid) {
      return fileValidation;
    }

    // Dimension validation
    const dimensionValidation = await this.validateImageDimensions(file);
    if (!dimensionValidation.valid) {
      return dimensionValidation;
    }

    // Combine warnings from both validations
    const allWarnings = [
      ...(fileValidation.warnings || []),
      ...(dimensionValidation.warnings || [])
    ];

    return {
      valid: true,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
  }

  /**
   * Validate form data for photo upload request
   */
  static validateUploadRequest(formData: FormData): PhotoValidationResult {
    const formId = formData.get('formId') as string;
    const personType = formData.get('personType') as string;
    const personId = formData.get('personId') as string | null;

    if (!formId || formId.trim() === '') {
      return { valid: false, error: 'Form ID is required' };
    }

    if (!personType || !['primary', 'spouse', 'child'].includes(personType)) {
      return { valid: false, error: 'Person type must be primary, spouse, or child' };
    }

    if (personType === 'child' && (!personId || personId.trim() === '')) {
      return { valid: false, error: 'Person ID is required for child photos' };
    }

    return { valid: true };
  }

  /**
   * Security validation to prevent malicious uploads
   */
  static async validateSecurity(file: File): Promise<PhotoValidationResult> {
    const warnings: string[] = [];

    // Check for suspicious file names
    const fileName = file.name.toLowerCase();
    const suspiciousPatterns = [
      '.php', '.js', '.html', '.xml', '.svg',
      'script', 'eval', 'exec', 'system'
    ];

    for (const pattern of suspiciousPatterns) {
      if (fileName.includes(pattern)) {
        return { valid: false, error: 'File name contains suspicious content' };
      }
    }

    // Check file size limits (additional security)
    const maxSecuritySize = 1024 * 1024; // 1MB absolute max for security
    if (file.size > maxSecuritySize) {
      return { valid: false, error: 'File too large for security reasons' };
    }

    // Check for minimum file size (avoid empty/corrupted files)
    if (file.size < 1024) { // 1KB minimum
      return { valid: false, error: 'File appears to be empty or corrupted' };
    }

    return { valid: true, warnings };
  }

  /**
   * Full validation pipeline for photo uploads
   */
  static async fullValidation(file: File, formData: FormData): Promise<PhotoValidationResult> {
    // Validate request data
    const requestValidation = this.validateUploadRequest(formData);
    if (!requestValidation.valid) {
      return requestValidation;
    }

    // Security validation
    const securityValidation = await this.validateSecurity(file);
    if (!securityValidation.valid) {
      return securityValidation;
    }

    // Photo validation
    const photoValidation = await this.validatePhoto(file);
    if (!photoValidation.valid) {
      return photoValidation;
    }

    // Combine all warnings
    const allWarnings = [
      ...(requestValidation.warnings || []),
      ...(securityValidation.warnings || []),
      ...(photoValidation.warnings || [])
    ];

    return {
      valid: true,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
  }
}

export default PhotoValidationMiddleware;