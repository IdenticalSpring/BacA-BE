import { BadRequestException } from '@nestjs/common';
import { mkdtemp, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { PresentationMediaStorageService } from './presentation-media-storage.service';

describe('PresentationMediaStorageService', () => {
  let temporaryRoot: string;
  let cwdSpy: jest.SpyInstance;
  let originalApiBaseUrl: string | undefined;
  let originalMaxMediaBytes: string | undefined;
  let service: PresentationMediaStorageService;

  beforeEach(async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), 'happyclass-ppt-media-'));
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(temporaryRoot);
    originalApiBaseUrl = process.env.API_BASE_URL;
    originalMaxMediaBytes = process.env.PRESENTATION_MAX_MEDIA_BYTES;
    process.env.API_BASE_URL = 'https://api.example.test/';
    delete process.env.PRESENTATION_MAX_MEDIA_BYTES;
    service = new PresentationMediaStorageService();
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
    if (originalMaxMediaBytes === undefined)
      delete process.env.PRESENTATION_MAX_MEDIA_BYTES;
    else process.env.PRESENTATION_MAX_MEDIA_BYTES = originalMaxMediaBytes;
    await rm(temporaryRoot, { recursive: true, force: true });
  });

  const mp3Buffer = () =>
    Buffer.concat([Buffer.from('ID3'), Buffer.from('happyclass-audio')]);

  it('stores audio under the public presentation upload path', async () => {
    const stored = await service.store(mp3Buffer(), 'audio/mpeg');

    expect(stored.url).toMatch(
      /^https:\/\/api\.example\.test\/uploads\/presentations\/[a-f0-9]{64}\.mp3$/,
    );
    expect(stored.mimeType).toBe('audio/mpeg');
    expect(stored.size).toBe(mp3Buffer().length);

    const fileName = stored.url.split('/').pop() as string;
    const persisted = await readFile(
      join(temporaryRoot, 'uploads', 'presentations', fileName),
    );
    expect(persisted).toEqual(mp3Buffer());
  });

  it('deduplicates identical media content', async () => {
    const first = await service.store(mp3Buffer(), 'audio/mpeg');
    const second = await service.store(mp3Buffer(), 'audio/mpeg');
    const files = await readdir(
      join(temporaryRoot, 'uploads', 'presentations'),
    );

    expect(second.url).toBe(first.url);
    expect(files).toHaveLength(1);
  });

  it('stores supported video with a safe extension', async () => {
    const video = Buffer.from('mock-mp4-video');
    const stored = await service.store(video, 'video/mp4');

    expect(stored.url).toMatch(/\.mp4$/);
    expect(stored.mimeType).toBe('video/mp4');
  });

  it('rejects unsupported declared media types', async () => {
    await expect(
      service.store(Buffer.from('document'), 'application/pdf'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces the configured media size limit', async () => {
    process.env.PRESENTATION_MAX_MEDIA_BYTES = '8';

    await expect(
      service.store(mp3Buffer(), 'audio/mpeg'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
