import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { access, mkdir, rename, rm, writeFile } from 'fs/promises';
import { join } from 'path';

type StoredPresentationImage = {
  url: string;
  mimeType: string;
  size: number;
};

type SupportedImage = {
  mimeType: string;
  extension: string;
};

@Injectable()
export class PresentationImageStorageService {
  async store(
    buffer: Buffer,
    declaredMimeType?: string,
  ): Promise<StoredPresentationImage> {
    const maxBytes = this.getMaxImageBytes();
    if (!buffer.length) throw new BadRequestException('Image file is empty');
    if (buffer.length > maxBytes) {
      throw new BadRequestException(
        `Presentation image must not exceed ${Math.floor(maxBytes / 1024 / 1024)} MB`,
      );
    }

    const image = this.detectImage(buffer);
    if (!image) {
      throw new BadRequestException(
        'Only PNG, JPEG, WebP, and GIF presentation images are supported',
      );
    }
    this.assertMimeTypeMatches(declaredMimeType, image.mimeType);

    const hash = createHash('sha256').update(buffer).digest('hex');
    const fileName = `${hash}.${image.extension}`;
    const storageDirectory = join(process.cwd(), 'uploads', 'presentations');
    const filePath = join(storageDirectory, fileName);

    try {
      await mkdir(storageDirectory, { recursive: true });
      await this.writeOnce(filePath, buffer);
    } catch (error) {
      console.error('Presentation image storage error:', {
        message: (error as Error)?.message || 'Unknown error',
        code: (error as NodeJS.ErrnoException)?.code || null,
      });
      throw new InternalServerErrorException(
        'Presentation image storage is unavailable',
      );
    }

    const baseUrl = (
      process.env.API_BASE_URL || 'https://api.happyclass.com.vn'
    ).replace(/\/+$/, '');
    return {
      url: `${baseUrl}/uploads/presentations/${fileName}`,
      mimeType: image.mimeType,
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

    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
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

  private getMaxImageBytes(): number {
    const configured = Number(process.env.PRESENTATION_MAX_IMAGE_BYTES);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : 10 * 1024 * 1024;
  }

  private assertMimeTypeMatches(
    declaredMimeType: string | undefined,
    detectedMimeType: string,
  ): void {
    if (!declaredMimeType) return;
    const normalized =
      declaredMimeType.toLowerCase() === 'image/jpg'
        ? 'image/jpeg'
        : declaredMimeType.toLowerCase();
    if (normalized !== detectedMimeType) {
      throw new BadRequestException(
        'Image content does not match its declared file type',
      );
    }
  }

  private detectImage(buffer: Buffer): SupportedImage | null {
    if (
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
      return { mimeType: 'image/png', extension: 'png' };
    }
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return { mimeType: 'image/jpeg', extension: 'jpg' };
    }
    if (buffer.length >= 6) {
      const signature = buffer.subarray(0, 6).toString('ascii');
      if (signature === 'GIF87a' || signature === 'GIF89a') {
        return { mimeType: 'image/gif', extension: 'gif' };
      }
    }
    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { mimeType: 'image/webp', extension: 'webp' };
    }
    return null;
  }
}
