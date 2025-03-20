import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

@Injectable()
export class CloudinaryService {
  constructor() {
    console.log('Cloudinary Config:');
    console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
    console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET);
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer): Promise<string> {
    try {
      console.log('Uploading buffer to Cloudinary...');

      // Chuyển Buffer thành Stream
      const stream = Readable.from(buffer);
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              reject(new Error('Cloudinary upload failed'));
            } else {
              console.log('Cloudinary Upload Success:', result.secure_url);
              resolve(result.secure_url);
            }
          },
        );
        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw new Error('Cloudinary upload failed');
    }
  }
}
