import { Module } from '@nestjs/common';
import { YoutubeUploadService } from './youtube.service';

@Module({
  providers: [YoutubeUploadService],
  exports: [YoutubeUploadService],
})
export class YoutubeModule {}
