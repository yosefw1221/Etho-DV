/**
 * Client-side image processing for photo compression and optimization
 * Works in the browser without external dependencies
 */

export interface CompressedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

export interface CompressionOptions {
  maxSizeKB?: number; // Maximum file size in KB (default: 240)
  quality?: number; // JPEG quality 0-1 (default: 0.85)
  maxDimensions?: number; // Maximum width/height (default: 1200)
  minDimensions?: number; // Minimum width/height (default: 600)
}

export class ClientImageProcessor {
  /**
   * Compress and optimize an image file for DV requirements
   */
  static async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressedImage> {
    const {
      maxSizeKB = 240,
      quality = 0.85,
      maxDimensions = 1200,
      minDimensions = 600
    } = options;

    try {
      // Load the image
      const image = await this.loadImage(file);
      
      // Validate dimensions
      if (image.width !== image.height) {
        throw new Error('Image must be square (equal width and height)');
      }

      if (image.width < minDimensions || image.height < minDimensions) {
        throw new Error(`Image must be at least ${minDimensions}x${minDimensions} pixels`);
      }

      if (image.width > maxDimensions || image.height > maxDimensions) {
        throw new Error(`Image must not exceed ${maxDimensions}x${maxDimensions} pixels`);
      }

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw image to canvas
      ctx.drawImage(image, 0, 0);

      // Compress with iterative quality reduction if needed
      let compressedFile = await this.canvasToFile(canvas, quality);
      let currentQuality = quality;

      // If file is still too large, reduce quality iteratively
      while (compressedFile.size > maxSizeKB * 1024 && currentQuality > 0.1) {
        currentQuality -= 0.1;
        compressedFile = await this.canvasToFile(canvas, currentQuality);
      }

      // If still too large after quality reduction, try resizing
      if (compressedFile.size > maxSizeKB * 1024) {
        const targetDimensions = Math.min(image.width * 0.9, 800);
        canvas.width = targetDimensions;
        canvas.height = targetDimensions;
        ctx.drawImage(image, 0, 0, targetDimensions, targetDimensions);
        compressedFile = await this.canvasToFile(canvas, currentQuality);
      }

      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: file.size / compressedFile.size,
        dimensions: { width: canvas.width, height: canvas.height }
      };

    } catch (error) {
      throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load image from file
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert canvas to compressed file
   */
  private static canvasToFile(canvas: HTMLCanvasElement, quality: number): Promise<File> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create blob from canvas');
          }
          
          const file = new File([blob], 'compressed-photo.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(file);
        },
        'image/jpeg',
        quality
      );
    });
  }

  /**
   * Resize image to exact square dimensions
   */
  static async resizeToSquare(
    file: File,
    targetDimensions: number
  ): Promise<File> {
    try {
      const image = await this.loadImage(file);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = targetDimensions;
      canvas.height = targetDimensions;

      // Calculate crop dimensions for square aspect ratio
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = (image.width - sourceSize) / 2;
      const sourceY = (image.height - sourceSize) / 2;

      // Draw cropped and resized image
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceSize, sourceSize, // Source rectangle
        0, 0, targetDimensions, targetDimensions   // Destination rectangle
      );

      return await this.canvasToFile(canvas, 0.85);

    } catch (error) {
      throw new Error(`Image resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image meets DV requirements
   */
  static async validateDVRequirements(file: File): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check file type
      if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
        errors.push('Photo must be in JPEG format');
      }

      // Check file size
      const maxSize = 240 * 1024; // 240KB
      if (file.size > maxSize) {
        errors.push(`File size must be under 240KB (current: ${Math.round(file.size / 1024)}KB)`);
      }

      // Load and check dimensions
      const image = await this.loadImage(file);
      
      if (image.width !== image.height) {
        errors.push('Photo must be square (equal width and height)');
      }

      if (image.width < 600 || image.height < 600) {
        errors.push('Photo must be at least 600x600 pixels');
      }

      if (image.width > 1200 || image.height > 1200) {
        errors.push('Photo must not exceed 1200x1200 pixels');
      }

      // Add warnings for sub-optimal settings
      if (file.size < 50 * 1024) {
        warnings.push('File size is quite small. Ensure photo quality is adequate.');
      }

      if (image.width < 800 || image.height < 800) {
        warnings.push('Photo resolution is on the lower end. Higher resolution is recommended.');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push('Failed to validate image');
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Auto-compress image to meet DV requirements
   */
  static async autoCompress(file: File): Promise<CompressedImage> {
    const validation = await this.validateDVRequirements(file);
    
    if (validation.valid) {
      // Already meets requirements, return as-is
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        dimensions: await this.getImageDimensions(file)
      };
    }

    // Apply compression to fix issues
    return await this.compressImage(file, {
      maxSizeKB: 240,
      quality: 0.85,
      maxDimensions: 1200,
      minDimensions: 600
    });
  }

  /**
   * Get image dimensions from file
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    const image = await this.loadImage(file);
    return { width: image.width, height: image.height };
  }

  /**
   * Create a preview URL for immediate display
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Clean up preview URL to prevent memory leaks
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export default ClientImageProcessor;