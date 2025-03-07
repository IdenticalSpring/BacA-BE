import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { YoutubeUploadService } from '../youtube/youtube.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly youtubeService: YoutubeUploadService,
  ) {}

  @Post('cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToCloudinary(@UploadedFile() file: any) {
    try {
      if (!file) {
        console.error('Không có file được upload!');
        throw new Error('No file uploaded');
      }

      console.log('Received file:', file.originalname);

      const url = await this.cloudinaryService.uploadBuffer(file.buffer);

      console.log('Upload thành công:', url);
      return { url };
    } catch (error) {
      console.error('Lỗi trong upload.controller.ts:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  @Post('youtube')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToYoutube(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      console.log('Uploading to YouTube:', file.originalname);

      const { videoId } = await this.youtubeService.uploadVideo(file);

      console.log('Upload YouTube thành công, Video ID:', videoId);
      return { videoId };
    } catch (error) {
      console.error('Lỗi upload lên YouTube:', error);
      throw new BadRequestException(`YouTube upload failed: ${error.message}`);
    }
  }
}
