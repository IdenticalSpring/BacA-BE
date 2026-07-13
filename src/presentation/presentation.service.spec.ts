import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PresentationService } from './presentation.service';

describe('PresentationService', () => {
  const presentationRepository: any = {
    find: jest.fn(),
    manager: { transaction: jest.fn(), getRepository: jest.fn() },
  };
  const assetRepository: any = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const shareRepository: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const tagRepository: any = {
    manager: { getRepository: jest.fn() },
    find: jest.fn(),
    findByIds: jest.fn(),
  };
  const presentationTagRepository: any = {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const lessonRepository: any = { findOne: jest.fn() };
  const deepSeekService: any = {
    generateText: jest.fn(),
    formatError: jest.fn((error) => error),
  };
  const imageStorageService: any = {
    store: jest.fn(),
  };

  let service: PresentationService;

  beforeEach(() => {
    jest.clearAllMocks();
    imageStorageService.store.mockResolvedValue({
      url: 'https://api.example.test/uploads/presentations/image.png',
      mimeType: 'image/png',
      size: 12,
    });
    service = new PresentationService(
      presentationRepository,
      assetRepository,
      shareRepository,
      tagRepository,
      presentationTagRepository,
      lessonRepository,
      deepSeekService,
      imageStorageService,
    );
  });

  it('lists only the authenticated owner presentations', async () => {
    presentationRepository.find.mockResolvedValue([]);

    await service.findMine({ userId: 42, role: 'teacher' });

    expect(presentationRepository.find).toHaveBeenCalledWith({
      where: { ownerId: 42, ownerRole: 'teacher', isDeleted: false },
      order: { updatedAt: 'DESC' },
      take: 100,
    });
  });

  it('rejects unauthenticated personal-library requests', async () => {
    await expect(service.findMine({ role: 'teacher' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects malformed AI output instead of returning fallback slides', async () => {
    deepSeekService.generateText.mockResolvedValue('not a JSON slide list');

    await expect(
      service.generateSlides({ topic: 'Vocabulary', outline: 'One slide' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects incomplete AI slide data', async () => {
    deepSeekService.generateText.mockResolvedValue(
      JSON.stringify([{ type: 'cover' }]),
    );

    await expect(
      service.generateSlides({ topic: 'Vocabulary', outline: 'One slide' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts only valid AI slide structures', async () => {
    deepSeekService.generateText.mockResolvedValue(
      JSON.stringify([
        { type: 'cover', data: { title: 'Vocabulary', text: 'Warm up' } },
        { type: 'end' },
      ]),
    );

    await expect(
      service.generateSlides({ topic: 'Vocabulary', outline: 'One slide' }),
    ).resolves.toEqual({
      outline: 'One slide',
      slides: [
        { type: 'cover', data: { title: 'Vocabulary', text: 'Warm up' } },
        { type: 'end' },
      ],
    });
  });

  it('rejects an unsupported asset before calling persistent storage', async () => {
    const findOneForManage = jest
      .spyOn(service as any, 'findOneForManage')
      .mockResolvedValue({});
    const file: any = {
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      originalname: 'document.pdf',
    };

    await expect(
      service.uploadAsset(1, file, {}, { userId: 42, role: 'teacher' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findOneForManage).toHaveBeenCalled();
  });

  it('stores embedded slide images locally and replaces their data URLs', async () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('slide-image'),
    ]);
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

    const normalized = await (service as any).normalizeContent({
      content: {
        slides: [
          { id: 'slide-1', elements: [{ type: 'image', src: dataUrl }] },
        ],
      },
    });

    expect(imageStorageService.store).toHaveBeenCalledWith(png, 'image/png');
    expect(JSON.parse(normalized.contentJson).slides[0].elements[0].src).toBe(
      'https://api.example.test/uploads/presentations/image.png',
    );
    expect(normalized.assets).toEqual([
      expect.objectContaining({
        url: 'https://api.example.test/uploads/presentations/image.png',
        mimeType: 'image/png',
        assetType: 'image',
      }),
    ]);
  });

  it('uses local presentation storage for uploaded image assets', async () => {
    jest.spyOn(service as any, 'findOneForManage').mockResolvedValue({ id: 1 });
    assetRepository.create.mockImplementation((value) => value);
    assetRepository.save.mockImplementation(async (value) => value);
    const buffer = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('uploaded-image'),
    ]);
    const file: any = {
      mimetype: 'image/png',
      size: buffer.length,
      buffer,
      originalname: 'lesson.png',
    };

    const asset = await service.uploadAsset(
      1,
      file,
      {},
      { userId: 42, role: 'teacher' },
    );

    expect(imageStorageService.store).toHaveBeenCalledWith(buffer, 'image/png');
    expect(asset).toEqual(
      expect.objectContaining({
        presentationId: 1,
        url: 'https://api.example.test/uploads/presentations/image.png',
        mimeType: 'image/png',
      }),
    );
  });

  it('creates new tags through the active transaction repository', async () => {
    const transactionRepository: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue({ id: 7, name: 'vocabulary' }),
    };
    const manager: any = {
      getRepository: jest.fn().mockReturnValue(transactionRepository),
    };

    await (service as any).findOrCreateTag(
      'vocabulary',
      'skill',
      false,
      manager,
    );

    expect(transactionRepository.save).toHaveBeenCalledWith({
      name: 'vocabulary',
      slug: 'skill-vocabulary',
      category: 'skill',
      isSystem: false,
    });
  });
  it('allows only admins to create system tags', async () => {
    await expect(
      service.createTag(
        { name: 'Official', category: 'skill', isSystem: true },
        { userId: 42, role: 'teacher' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires a tag before creating a share link', async () => {
    jest.spyOn(service as any, 'findOneForManage').mockResolvedValue({ id: 1 });
    presentationRepository.manager.getRepository.mockReturnValue({
      count: jest.fn().mockResolvedValue(0),
    });

    await expect(
      service.createShare(
        1,
        { permission: 'read', canDownload: false },
        { userId: 42, role: 'teacher' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a stale presentation version before saving', async () => {
    jest.spyOn(service as any, 'findOneForManage').mockResolvedValue({
      id: 1,
      ownerId: 42,
      version: 3,
    });

    await expect(
      service.update(
        1,
        { title: 'Stale update', version: 2 },
        { userId: 42, role: 'teacher' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
