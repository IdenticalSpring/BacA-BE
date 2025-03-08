import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class YoutubeService {
  private youtube = google.youtube('v3');

  private oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );

  constructor() {
    this.oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
  }

  private async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      console.log('Access Token refreshed');
    } catch (error) {
      console.error('Error refreshing Access Token:', error);
      throw error;
    }
  }

  async uploadVideo(file: any, title: string, description: string, status: boolean) {
    await this.refreshAccessToken();

    if (!file.path) {
      throw new Error('File path is undefined! Kiểm tra lại multer dest.');
    }

    const filePath = file.path;
    console.log('Uploading file from:', filePath);

    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;

    try {
      console.log(`Uploading video: ${filePath}`);

      const res = await this.youtube.videos.insert(
        {
          auth: this.oauth2Client,
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: title,
              description: description,
            },
            status: {
              privacyStatus: status ? 'public' : 'private',
            },
          },
          media: {
            body: fileStream,
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
        },
      );

      console.log('Video uploaded successfully:', res.data);

      if (res.data.id) {
        fs.unlinkSync(filePath);
        console.log('Temp file deleted.');
      }

      return res.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }


  async showHello() {
    console.log('Hello');
  }
}
