import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private logger = new Logger('UploadService');
  private allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  private maxFileSize = 5 * 1024 * 1024;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /**
   * Upload a file buffer to Cloudinary.
   * Resizes images to max 1200x1200, retains aspect ratio.
   *
   * @param {Express.Multer.File} file - File object from multer
   * @param {Object} [options] - Additional Cloudinary options
   * @returns {Promise<Object>} - Cloudinary upload result (contains secure_url)
   */
  async uploadFile(file: any, options: any = {}) {
    // Validate file existence
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Build upload options
    const uploadOptions: any = {
      resource_type: 'auto',
      folder: options.folder || 'leads',
      public_id: options.publicId || this.generatePublicId(file),
      transformation: options.transformation || [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
      ],
      ...options,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete a file from Cloudinary by public_id.
   *
   * @param {string} publicId - Cloudinary public_id
   * @param {string} [resourceType='image'] - 'image' or 'raw'
   * @returns {Promise<Object>}
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      this.logger.log(`Cloudinary delete result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Cloudinary delete error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates a unique public ID for the uploaded file.
   * @param {Express.Multer.File} file
   * @returns {string}
   */
  generatePublicId(file) {
    const ext = file.originalname?.split('.').pop() || 'file';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `lead-${timestamp}-${random}.${ext}`;
  }
}