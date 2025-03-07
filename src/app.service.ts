import { Injectable } from '@nestjs/common';
import { YoutubeService } from './youtube/youtube.service';

@Injectable()
export class AppService {
  constructor(private readonly youtubeService: YoutubeService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getAnnounce() {
    this.youtubeService.showHello();
  }
}
