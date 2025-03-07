import { YoutubeService } from './youtube.service';
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('youtube')
export class YoutubeController {
    constructor(private readonly youtubeService: YoutubeService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadToYoutube(@UploadedFile() file: any) {
        try {
            if (!file) {
                throw new BadRequestException('No file uploaded');
            }

            console.log('Uploading to YouTube:', file.originalname);

            const isUploaded = await this.youtubeService.uploadVideo(file);

            console.log('Upload YouTube thành công, Video ID:', isUploaded);
            return isUploaded;
        } catch (error) {
            console.error('Lỗi upload lên YouTube:', error);
            throw new BadRequestException(`YouTube upload failed: ${error.message}`);
        }
    }

    @Get('test')
    async showSomeThing() {
        console.log('Hello');
        return { message: 'Hello from YouTube test endpoint!' };
    }
}
