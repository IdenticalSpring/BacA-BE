import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

@Injectable()
export class CloudinaryService {
  constructor() {
    CloudinaryService.configure();
    console.log('Cloudinary Config:', {
      cloudNameConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
      apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER || '',
    });
  }

  private static configure(): void {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private static formatUploadError(error: unknown): Error {
    const message = (error as Error)?.message || 'Unknown error';
    return new Error('Cloudinary upload failed: ' + message);
  }

  static async uploadBuffer(buffer: Buffer): Promise<string> {
    try {
      CloudinaryService.configure();
      console.log('Uploading buffer to Cloudinary...');

      const folder = process.env.CLOUDINARY_FOLDER || '';
      const uploadOptions: Record<string, any> = { resource_type: 'auto' };
      if (folder) uploadOptions.folder = folder;

      const stream = Readable.from(buffer);
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              reject(CloudinaryService.formatUploadError(error));
              return;
            }
            if (!result?.secure_url) {
              reject(new Error('Cloudinary upload failed: secure_url missing'));
              return;
            }
            console.log('Cloudinary Upload Success:', result.secure_url);
            resolve(result.secure_url);
          },
        );
        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw CloudinaryService.formatUploadError(error);
    }
  }

  static async uploadMultipleBuffers(buffers: Buffer[]): Promise<string[]> {
    try {
      CloudinaryService.configure();
      console.log('Uploading multiple buffers to Cloudinary...');
      return await Promise.all(buffers.map((buffer) => CloudinaryService.uploadBuffer(buffer)));
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw CloudinaryService.formatUploadError(error);
    }
  }
}
