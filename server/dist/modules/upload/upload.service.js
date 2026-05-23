"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
let UploadService = class UploadService {
    logger = new common_1.Logger('UploadService');
    allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    maxFileSize = 5 * 1024 * 1024;
    constructor() {
        cloudinary_1.v2.config({
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
    async uploadFile(file, options = {}) {
        // Validate file existence
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file provided');
        }
        // Validate file type
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
        // Validate file size
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
        }
        // Build upload options
        const uploadOptions = {
            resource_type: 'auto',
            folder: options.folder || 'leads',
            public_id: options.publicId || this.generatePublicId(file),
            transformation: options.transformation || [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
            ],
            ...options,
        };
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary upload failed: ${error.message}`);
                    reject(new Error(`Upload failed: ${error.message}`));
                }
                else {
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
            });
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
            const result = await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
            this.logger.log(`Cloudinary delete result: ${JSON.stringify(result)}`);
            return result;
        }
        catch (error) {
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
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadService);
