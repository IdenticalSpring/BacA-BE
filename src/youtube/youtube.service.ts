import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class YoutubeService {
  private youtube = google.youtube('v3');

  async uploadVideo(file: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const fileSize = file.size;
    const fileStream = fs.createReadStream(file.path);

    const res = await this.youtube.videos.insert(
      {
        auth: oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: 'Video title',
            description: 'Test Video',
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: fileStream,
        },
      },
      {
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
      },
    );

    fs.unlinkSync(file.path);

    return res.data;
  }
}
