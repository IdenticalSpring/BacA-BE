import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { access, mkdir, rename, rm, writeFile } from 'fs/promises';
import { join } from 'path';

type StoredPresentationMedia = {
  url: string;
  mimeType: string;
  size: number;
};

const SUPPORTED_MEDIA_TYPES: Readonly<Record<string, string>> = {
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/midi': 'mid',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'oga',
  'audio/vnd.wave': 'wav',
  'audio/wav': 'wav',
  'audio/webm': 'weba',
  'audio/x-aiff': 'aif',
  'audio/x-flac': 'flac',
  'audio/x-m4a': 'm4a',
  'audio/x-ms-wma': 'wma',
  'audio/x-wav': 'wav',
  'video/3gpp': '3gp',
  'video/3gpp2': '3g2',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-flv': 'flv',
  'video/x-m4v': 'm4v',
  'video/x-ms-wmv': 'wmv',
  'video/x-msvideo': 'avi',
};

@Injectable()
export class PresentationMediaStorageService {
  async store(
    buffer: Buffer,
    declaredMimeType?: string,
  ): Promise<StoredPresentationMedia> {
    const maxBytes = this.getMaxMediaBytes();
    if (!buffer.length) {
      throw new BadRequestException('Presentation media file is empty');
    }
    if (buffer.length > maxBytes) {
      throw new BadRequestException(
        'Presentation media must not exceed ' +
          Math.floor(maxBytes / 1024 / 1024) +
          ' MB',
      );
    }

    const mimeType = this.normalizeMimeType(declaredMimeType);
    const extension = SUPPORTED_MEDIA_TYPES[mimeType];
    if (!extension) {
      throw new BadRequestException(
        'This presentation audio or video format is not supported',
      );
    }

    const hash = createHash('sha256').update(buffer).digest('hex');
    const fileName = hash + '.' + extension;
    const storageDirectory = join(process.cwd(), 'uploads', 'presentations');
    const filePath = join(storageDirectory, fileName);

    try {
      await mkdir(storageDirectory, { recursive: true });
      await this.writeOnce(filePath, buffer);
    } catch (error) {
      console.error('Presentation media storage error:', {
        message: (error as Error)?.message || 'Unknown error',
        code: (error as NodeJS.ErrnoException)?.code || null,
      });
      throw new InternalServerErrorException(
        'Presentation media storage is unavailable',
      );
    }

    const baseUrl = (
      process.env.API_BASE_URL || 'https://api.happyclass.com.vn'
    ).replace(/\/+$/, '');
    return {
      url: baseUrl + '/uploads/presentations/' + fileName,
      mimeType,
      size: buffer.length,
    };
  }

  private async writeOnce(filePath: string, buffer: Buffer): Promise<void> {
    try {
      await access(filePath);
      return;
    } catch {
      // Continue with an atomic write when this hash is not stored yet.
    }

    const temporaryPath = filePath + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporaryPath, buffer, { flag: 'wx', mode: 0o640 });
      await rename(temporaryPath, filePath);
    } catch (error) {
      if (
        !['EEXIST', 'EPERM'].includes(
          (error as NodeJS.ErrnoException)?.code || '',
        )
      ) {
        throw error;
      }
      await access(filePath);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }

  private getMaxMediaBytes(): number {
    const configured = Number(process.env.PRESENTATION_MAX_MEDIA_BYTES);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : 25 * 1024 * 1024;
  }

  private normalizeMimeType(declaredMimeType?: string): string {
    return (declaredMimeType || '').split(';', 1)[0].trim().toLowerCase();
  }
}
