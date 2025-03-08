import { YoutubeService } from './youtube.service';
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Body,
    Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('youtube')
export class YoutubeController {
    constructor(private readonly youtubeService: YoutubeService) { }

    // DEBUGGING
    // @Post('upload')
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadToYoutube(@UploadedFile() file: any) {
    //     try {

    //         const filepath = 'D:\\Videos\\5949418770864994145.mp4';

    //         console.log('Uploading fixed video:', filepath);

    //         const file = {
    //             path: filepath,
    //             originalname: 'sample_video.mp4',
    //         };

    //         const uploadedVideo = await this.youtubeService.uploadVideo(file);

    //         return { message: 'Upload thành công', videoId: uploadedVideo.id };
    //     } catch (error) {
    //         console.error('Lỗi upload lên YouTube:', error);
    //         throw new BadRequestException(`YouTube upload failed: ${error.message}`);
    //     }
    // }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
    async uploadToYoutube(
        @UploadedFile() file: any,
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('status') status: boolean
    ) {
        try {
            if (!file) {
                throw new BadRequestException('File không được để trống!');
            }

            console.log('File nhận được:', file);
            console.log('Title:', title);
            console.log('Description:', description);
            console.log('Status:', status);

            const uploadedVideo = await this.youtubeService.uploadVideo(
                file,
                title,
                description,
                status === 'true'
            );

            return { message: 'Upload thành công', videoId: uploadedVideo.id };
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
