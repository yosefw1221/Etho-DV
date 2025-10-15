import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export class SimpleStorageService {
  private static uploadDir = path.join(process.cwd(), 'public', 'uploads');

  /**
   * Ensure upload directory exists
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Upload a file to local storage
   */
  static async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<UploadResult> {
    await this.ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(filename) || '.jpg';
    const uniqueFilename = `${timestamp}-${randomStr}${ext}`;
    
    const filePath = path.join(this.uploadDir, uniqueFilename);
    
    // Write file to disk
    await writeFile(filePath, fileBuffer);
    
    // Return public URL
    const publicUrl = `/uploads/${uniqueFilename}`;
    
    return {
      url: publicUrl,
      key: uniqueFilename,
      size: fileBuffer.length
    };
  }

  /**
   * Delete a file from local storage
   */
  static async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
      console.warn(`Failed to delete file ${key}:`, error);
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(key: string): string {
    return `/uploads/${key}`;
  }
}