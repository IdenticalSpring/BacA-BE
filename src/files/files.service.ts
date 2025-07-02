// src/files/files.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  saveFile(file: Express.Multer.File) {
    const baseUrl = process.env.API_BASE_URL || 'https://api.happyclass.com.vn'; // Dùng biến môi trường hoặc mặc định cổng 8000
    return {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      url: `${baseUrl}/${file.path.replace(/\\/g, '/')}`, // Thêm trường url
      size: file.size,
      mimeType: file.mimetype,
    };
  }
  saveFiles(files: Express.Multer.File[]) {
    const baseUrl = process.env.API_BASE_URL || 'https://api.happyclass.com.vn';
    return files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      url: `${baseUrl}/${file.path.replace(/\\/g, '/')}`,
      size: file.size,
      mimeType: file.mimetype,
    }));
  }
}
