import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToCloudinary(@UploadedFile() file: any): Promise<{}> {
    try {
      if (!file) {
        console.error('Không có file được upload!');
        throw new Error('No file uploaded');
      }

      console.log('Received file:', file.originalname);

      // Upload buffer trực tiếp lên Cloudinary
      const url = await this.cloudinaryService.uploadBuffer(file.buffer);

      console.log('Upload thành công:', url);
      return { url };
    } catch (error) {
      console.error('Lỗi trong upload.controller.ts:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
