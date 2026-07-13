import { BadRequestException } from '@nestjs/common';
import { mkdtemp, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { PresentationImageStorageService } from './presentation-image-storage.service';

describe('PresentationImageStorageService', () => {
  let temporaryRoot: string;
  let cwdSpy: jest.SpyInstance;
  let originalApiBaseUrl: string | undefined;
  let originalMaxImageBytes: string | undefined;
  let service: PresentationImageStorageService;

  beforeEach(async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), 'happyclass-ppt-image-'));
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(temporaryRoot);
    originalApiBaseUrl = process.env.API_BASE_URL;
    originalMaxImageBytes = process.env.PRESENTATION_MAX_IMAGE_BYTES;
    process.env.API_BASE_URL = 'https://api.example.test/';
    delete process.env.PRESENTATION_MAX_IMAGE_BYTES;
    service = new PresentationImageStorageService();
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
    if (originalMaxImageBytes === undefined)
      delete process.env.PRESENTATION_MAX_IMAGE_BYTES;
    else process.env.PRESENTATION_MAX_IMAGE_BYTES = originalMaxImageBytes;
    await rm(temporaryRoot, { recursive: true, force: true });
  });

  const pngBuffer = () =>
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('happyclass'),
    ]);

  it('stores a PNG under the public presentation upload path', async () => {
    const stored = await service.store(pngBuffer(), 'image/png');

    expect(stored.url).toMatch(
      /^https:\/\/api\.example\.test\/uploads\/presentations\/[a-f0-9]{64}\.png$/,
    );
    expect(stored.mimeType).toBe('image/png');
    expect(stored.size).toBe(pngBuffer().length);

    const fileName = stored.url.split('/').pop() as string;
    const persisted = await readFile(
      join(temporaryRoot, 'uploads', 'presentations', fileName),
    );
    expect(persisted).toEqual(pngBuffer());
  });

  it('deduplicates identical image content', async () => {
    const first = await service.store(pngBuffer(), 'image/png');
    const second = await service.store(pngBuffer(), 'image/png');
    const files = await readdir(
      join(temporaryRoot, 'uploads', 'presentations'),
    );

    expect(second.url).toBe(first.url);
    expect(files).toHaveLength(1);
  });

  it('rejects content that does not match the declared image type', async () => {
    await expect(
      service.store(pngBuffer(), 'image/jpeg'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unsupported image content', async () => {
    await expect(
      service.store(Buffer.from('<svg></svg>'), 'image/svg+xml'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces the configured image size limit', async () => {
    process.env.PRESENTATION_MAX_IMAGE_BYTES = '8';

    await expect(
      service.store(pngBuffer(), 'image/png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
