import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class YoutubeUploadService {
  private youtube = google.youtube('v3');
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    this.oauth2Client.setCredentials({
      access_token: process.env.ACCESS_TOKEN,
      refresh_token: process.env.REFRESH_TOKEN,
    });
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      console.log('Access Token mới:', credentials.access_token);

      this.updateEnvFile('ACCESS_TOKEN', credentials.access_token);

      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Lỗi khi làm mới Access Token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  private updateEnvFile(key: string, value: string): void {
    const envPath = path.resolve(__dirname, '../../.env');
    if (!fs.existsSync(envPath)) return;

    let envContent = fs.readFileSync(envPath, 'utf-8');
    const regex = new RegExp(`^${key}=.*`, 'm');

    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`Đã cập nhật ${key} trong .env`);
  }

  async uploadVideo(file: any): Promise<{ videoId: string }> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      console.log('Uploading video:', file.originalname);

      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const videoPath = path.join(uploadDir, file.originalname);
      console.log('Saving file to:', videoPath);

      fs.writeFileSync(videoPath, file.buffer);

      const response = await this.youtube.videos.insert({
        auth: this.oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: 'My Video Upload',
            description: 'Uploaded via NestJS',
            tags: ['nestjs', 'youtube', 'api'],
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      console.log('Upload thành công:', response.data);
      return { videoId: response.data.id };
    } catch (error) {
      if (error.message.includes('Invalid Credentials')) {
        console.log('Access Token có thể đã hết hạn. Đang làm mới...');
        await this.refreshAccessToken();
        return this.uploadVideo(file);
      }
      console.error('Lỗi khi upload video:', error);
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }
}