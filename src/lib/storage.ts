import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// DigitalOcean Spaces configuration
const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: 'us-east-1', // DigitalOcean Spaces uses us-east-1 regardless of datacenter
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
  forcePathStyle: false, // Configures to use subdomain/virtual calling format
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET!;

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export class StorageService {
  /**
   * Upload a file to DigitalOcean Spaces
   */
  static async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: metadata,
      });

      await spacesClient.send(command);

      const url = `https://${BUCKET_NAME}.${process.env.DO_SPACES_ENDPOINT?.replace('https://', '')}/${key}`;

      return {
        url,
        key,
        size: file.length,
      };
    } catch (error) {
      console.error('Error uploading file to Spaces:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete a file from DigitalOcean Spaces
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await spacesClient.send(command);
    } catch (error) {
      console.error('Error deleting file from Spaces:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Get a signed URL for private file access
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(spacesClient, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  }

  /**
   * Generate a unique file key for photo uploads
   */
  static generatePhotoKey(userId: string, formId: string, personType: string, fileExtension: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `photos/${userId}/${formId}/${personType}-${timestamp}-${randomId}.${fileExtension}`;
  }

  /**
   * Validate file type and size for DV photos
   */
  static validatePhotoFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      return { valid: false, error: 'Photo must be in JPEG format' };
    }

    // Check file size (240KB max)
    const maxSize = 240 * 1024; // 240KB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be under 240KB (current: ${Math.round(file.size / 1024)}KB)` };
    }

    return { valid: true };
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(imageElement: HTMLImageElement): { valid: boolean; error?: string } {
    const { width, height } = imageElement;
    
    // DV photo requirements: 600x600 to 1200x1200 pixels, square
    if (width !== height) {
      return { valid: false, error: 'Photo must be square (equal width and height)' };
    }
    
    if (width < 600 || height < 600) {
      return { valid: false, error: 'Photo must be at least 600x600 pixels' };
    }
    
    if (width > 1200 || height > 1200) {
      return { valid: false, error: 'Photo must not exceed 1200x1200 pixels' };
    }
    
    return { valid: true };
  }
}

export default StorageService;