import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly filesService: FilesService) {}

  // Compatibility alias for already-deployed or cached clients.
  // Files are stored under the VPS uploads directory; no external service is called.
  @Post('cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  uploadLegacyFile(@UploadedFile() file: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    const storedFile = this.filesService.saveFile(file);
    return { url: storedFile.url };
  }

  @Post('avatar/')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadLegacyAvatar(@UploadedFile() avatar: Express.Multer.File): {
    url: string;
  } {
    if (!avatar) throw new BadRequestException('No file uploaded');
    const storedFile = this.filesService.saveFile(avatar);
    return { url: storedFile.url };
  }
}
