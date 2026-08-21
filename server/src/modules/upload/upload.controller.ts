import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

@Controller('upload')
export class UploadController {
  private logger = new Logger('UploadController');

  constructor(private uploadService: UploadService) {}

  /**
   * POST /api/upload/image
   *
   * Admin-only image upload, so banners and covers can be picked from disk
   * instead of requiring a URL from somewhere else. Returns the hosted URL and
   * the image's natural dimensions, which the banner editor uses to suggest a
   * sensible frame.
   */
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file provided');
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image type: ${file.mimetype}. Use JPEG, PNG, GIF or WebP.`,
      );
    }

    try {
      // Banners are wide, so cap on width alone — the square 1200x1200 limit
      // the default uses would shrink a 2400x600 creative to 1200x300.
      const result = (await this.uploadService.uploadFile(file, {
        folder: 'site',
        transformation: [{ width: 2000, crop: 'limit', quality: 'auto' }],
      })) as any;

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (err) {
      this.logger.error(`Image upload failed: ${err.message}`);
      throw new InternalServerErrorException('Image upload failed');
    }
  }
}
