import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeepSeekService } from 'src/common/deepseek.service';
import { Lesson } from 'src/lesson/lesson.entity';
import { PresentationAsset } from './presentation-asset.entity';
import { PresentationImageStorageService } from './presentation-image-storage.service';
import { PresentationShare } from './presentation-share.entity';
import { PresentationTag } from './presentation-tag.entity';
import { Presentation } from './presentation.entity';
import { PptTag } from './ppt-tag.entity';
import {
  AssetMetadataDto,
  CreatePresentationShareDto,
  CreatePptTagDto,
  GeneratePresentationOutlineDto,
  GeneratePresentationSlidesDto,
  RewritePresentationTextDto,
  SavePresentationDto,
  UpdatePresentationShareDto,
  UpdatePresentationTagsDto,
} from './presentation.dto';

type AuthUser = {
  userId?: number;
  role?: string;
};

type NormalizedAsset = {
  url: string;
  mimeType?: string;
  size?: number;
  assetType?: string;
  originalName?: string;
  metadata?: unknown;
};

type AIPptSlide =
  | { type: 'cover'; data: { title: string; text: string } }
  | { type: 'contents'; data: { items: string[] }; offset?: number }
  | { type: 'transition'; data: { title: string; text: string } }
  | {
      type: 'content';
      data: { title: string; items: { title: string; text: string }[] };
      offset?: number;
    }
  | { type: 'end' };

@Injectable()
export class PresentationService {
  constructor(
    @InjectRepository(Presentation)
    private readonly presentationRepository: Repository<Presentation>,
    @InjectRepository(PresentationAsset)
    private readonly assetRepository: Repository<PresentationAsset>,
    @InjectRepository(PresentationShare)
    private readonly shareRepository: Repository<PresentationShare>,
    @InjectRepository(PptTag)
    private readonly tagRepository: Repository<PptTag>,
    @InjectRepository(PresentationTag)
    private readonly presentationTagRepository: Repository<PresentationTag>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly deepSeekService: DeepSeekService,
    private readonly imageStorageService: PresentationImageStorageService,
  ) {}

  async create(
    dto: SavePresentationDto,
    user: AuthUser,
  ): Promise<Presentation> {
    await this.assertLessonAccess(dto.lessonId, user);

    const lessonId = this.toNullableNumber(dto.lessonId);
    if (lessonId && user?.userId) {
      const existing = await this.presentationRepository.findOne({
        where: {
          lessonId,
          ownerId: user.userId,
          ownerRole: user.role || 'teacher',
          isDeleted: false,
        },
        order: { updatedAt: 'DESC' },
      });
      if (existing) {
        return this.update(
          existing.id,
          { ...dto, version: existing.version || 1 },
          user,
        );
      }
    }

    const normalized = await this.normalizeContent(dto);
    const savedId = await this.presentationRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(Presentation);
        const presentation = repository.create({
          title: dto.title?.trim() || 'Untitled presentation',
          lessonId,
          lessonByScheduleId: this.toNullableNumber(dto.lessonByScheduleId),
          ownerId: user?.userId || null,
          ownerRole: user?.role || 'teacher',
          contentJson: normalized.contentJson,
          metadataJson: this.stringifyJson(dto.metadata, dto.metadataJson),
          status: dto.status || 'draft',
          language: dto.language || 'vi',
          version: 1,
          thumbnailUrl: dto.thumbnailUrl || null,
        });
        const saved = await repository.save(presentation);
        await this.syncPresentationAssets(
          saved.id,
          normalized.assets,
          normalized.contentJson,
          manager,
        );
        await this.syncTags(saved.id, dto, manager);
        if (saved.status === 'published')
          await this.assertHasTags(saved.id, manager);
        return saved.id;
      },
    );
    return this.findOne(savedId);
  }

  async update(
    id: number,
    dto: SavePresentationDto,
    user: AuthUser,
  ): Promise<Presentation> {
    const current = await this.findOneForManage(id, user);
    if (dto.version !== undefined && dto.version !== (current.version || 1)) {
      throw new ConflictException('Presentation version conflict');
    }
    await this.assertLessonAccess(dto.lessonId, user);
    const normalized = await this.normalizeContent(dto);

    const updatedId = await this.presentationRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(Presentation);
        const presentation = await repository.findOne({
          where: { id, isDeleted: false },
          lock: { mode: 'pessimistic_write' },
        });
        if (!presentation)
          throw new NotFoundException(`Presentation ${id} not found`);
        this.assertCanManage(presentation, user);
        if (
          dto.version !== undefined &&
          dto.version !== (presentation.version || 1)
        ) {
          throw new ConflictException('Presentation version conflict');
        }

        if (dto.title !== undefined) presentation.title = dto.title.trim();
        if (dto.lessonId !== undefined)
          presentation.lessonId = this.toNullableNumber(dto.lessonId);
        if (dto.lessonByScheduleId !== undefined)
          presentation.lessonByScheduleId = this.toNullableNumber(
            dto.lessonByScheduleId,
          );
        if (dto.content !== undefined || dto.contentJson !== undefined)
          presentation.contentJson = normalized.contentJson;
        if (dto.metadata !== undefined || dto.metadataJson !== undefined) {
          presentation.metadataJson = this.stringifyJson(
            dto.metadata,
            dto.metadataJson,
          );
        }
        if (dto.status !== undefined) presentation.status = dto.status;
        if (dto.language !== undefined) presentation.language = dto.language;
        if (dto.thumbnailUrl !== undefined)
          presentation.thumbnailUrl = dto.thumbnailUrl;
        presentation.version = (presentation.version || 1) + 1;

        const saved = await repository.save(presentation);
        if (dto.content !== undefined || dto.contentJson !== undefined) {
          await this.syncPresentationAssets(
            saved.id,
            normalized.assets,
            saved.contentJson,
            manager,
          );
        }
        await this.syncTags(saved.id, dto, manager);
        if (saved.status === 'published')
          await this.assertHasTags(saved.id, manager);
        return saved.id;
      },
    );
    return this.findOne(updatedId);
  }

  async findAllByLesson(
    lessonId: number,
    user: AuthUser,
  ): Promise<Presentation[]> {
    const where: any = { lessonId, isDeleted: false };
    if (user?.role !== 'admin') {
      where.ownerId = user?.userId || null;
      where.ownerRole = user?.role || 'teacher';
    }

    return this.presentationRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findMine(user: AuthUser): Promise<Presentation[]> {
    if (!user?.userId)
      throw new ForbiddenException('Authenticated user is required');
    return this.presentationRepository.find({
      where: {
        ownerId: user.userId,
        ownerRole: user.role || 'teacher',
        isDeleted: false,
      },
      order: { updatedAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(
    id: number,
  ): Promise<Presentation & { assets: PresentationAsset[]; tags: PptTag[] }> {
    const presentation = await this.presentationRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!presentation) {
      throw new NotFoundException(`Presentation ${id} not found`);
    }
    const assets = await this.assetRepository.find({
      where: { presentationId: id },
      order: { createdAt: 'DESC' },
    });
    const tags = await this.getTagsForPresentation(id);
    return Object.assign(presentation, { assets, tags });
  }

  async findOneForAuthenticatedUser(
    id: number,
    user: AuthUser,
  ): Promise<Presentation & { assets: PresentationAsset[]; tags: PptTag[] }> {
    await this.findOneForManage(id, user);
    return this.findOne(id);
  }

  async softDelete(id: number, user: AuthUser): Promise<void> {
    const presentation = await this.findOneForManage(id, user);
    presentation.isDeleted = true;
    await this.presentationRepository.save(presentation);
  }

  async uploadAsset(
    presentationId: number,
    file: Express.Multer.File,
    dto: AssetMetadataDto,
    user: AuthUser,
  ): Promise<PresentationAsset> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    await this.findOneForManage(presentationId, user);

    if (!/^(image|audio|video)\//i.test(file.mimetype || '')) {
      throw new BadRequestException(
        'Only image, audio, and video files are supported',
      );
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('Asset size must not exceed 25 MB');
    }

    const buffer = this.getFileBuffer(file);
    const storedImage = file.mimetype?.startsWith('image/')
      ? await this.imageStorageService.store(buffer, file.mimetype)
      : null;
    const url =
      storedImage?.url || (await CloudinaryService.uploadBuffer(buffer));
    const asset = this.assetRepository.create({
      presentationId,
      assetType: this.getAssetType(file.mimetype),
      url,
      originalName: file.originalname,
      mimeType: storedImage?.mimeType || file.mimetype,
      size: storedImage?.size || file.size,
      metadataJson: this.stringifyJson(dto?.metadata, dto?.metadataJson),
    });
    return this.assetRepository.save(asset);
  }

  async createShare(
    presentationId: number,
    dto: CreatePresentationShareDto,
    user: AuthUser,
  ): Promise<PresentationShare> {
    await this.findOneForManage(presentationId, user);
    await this.assertHasTags(presentationId);
    const share = this.shareRepository.create({
      presentationId,
      token: this.createShareToken(),
      permission: dto.permission || 'read',
      canDownload: dto.canDownload === true,
      isActive: true,
      expiresAt: this.toFutureDate(dto.expiresAt),
      createdById: user?.userId || null,
      createdByRole: user?.role || null,
    });
    return this.shareRepository.save(share);
  }

  async findShares(
    presentationId: number,
    user: AuthUser,
  ): Promise<PresentationShare[]> {
    await this.findOneForManage(presentationId, user);
    return this.shareRepository.find({
      where: { presentationId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async updateShare(
    presentationId: number,
    shareId: number,
    dto: UpdatePresentationShareDto,
    user: AuthUser,
  ): Promise<PresentationShare> {
    await this.findOneForManage(presentationId, user);
    const share = await this.shareRepository.findOne({
      where: { id: shareId, presentationId },
    });
    if (!share) throw new NotFoundException('Share link not found');
    if (dto.permission !== undefined) share.permission = dto.permission;
    if (dto.canDownload !== undefined) share.canDownload = dto.canDownload;
    if (dto.isActive !== undefined) share.isActive = dto.isActive;
    if (dto.expiresAt !== undefined)
      share.expiresAt = this.toFutureDate(dto.expiresAt);
    return this.shareRepository.save(share);
  }

  async revokeShare(
    presentationId: number,
    shareId: number,
    user: AuthUser,
  ): Promise<void> {
    await this.updateShare(presentationId, shareId, { isActive: false }, user);
  }

  async findShared(token: string): Promise<{
    presentation: Presentation & {
      assets: PresentationAsset[];
      tags: PptTag[];
    };
    share: PresentationShare;
  }> {
    const share = await this.findActiveShare(token);
    const presentation = await this.findOne(share.presentationId);
    return { presentation, share };
  }

  async cloneFromShare(
    token: string,
    user: AuthUser,
  ): Promise<Presentation & { assets: PresentationAsset[]; tags: PptTag[] }> {
    const share = await this.findActiveShare(token);
    if (share.permission !== 'edit_copy') {
      throw new ForbiddenException('This share link does not allow editing');
    }
    if (!user?.userId)
      throw new ForbiddenException('Teacher or admin sign-in is required');

    const source = await this.findOne(share.presentationId);
    const savedCopyId = await this.presentationRepository.manager.transaction(
      async (manager) => {
        const presentationRepository = manager.getRepository(Presentation);
        const assetRepository = manager.getRepository(PresentationAsset);
        const copy = presentationRepository.create({
          title: `${source.title} - Copy`,
          lessonId: null,
          lessonByScheduleId: null,
          ownerId: user.userId,
          ownerRole: user.role || 'teacher',
          contentJson: source.contentJson,
          metadataJson: source.metadataJson,
          status: 'draft',
          language: source.language,
          thumbnailUrl: source.thumbnailUrl,
        });
        const savedCopy = await presentationRepository.save(copy);
        const sourceAssets = await assetRepository.find({
          where: { presentationId: source.id },
        });
        if (sourceAssets.length) {
          await assetRepository.save(
            sourceAssets.map((asset) =>
              assetRepository.create({
                presentationId: savedCopy.id,
                assetType: asset.assetType,
                url: asset.url,
                originalName: asset.originalName,
                mimeType: asset.mimeType,
                size: asset.size,
                metadataJson: asset.metadataJson,
              }),
            ),
          );
        }
        await this.copyTags(source.id, savedCopy.id, manager);
        return savedCopy.id;
      },
    );
    return this.findOne(savedCopyId);
  }

  async findTags(category?: string): Promise<PptTag[]> {
    const where: any = { isDeleted: false };
    if (category) where.category = category;
    return this.tagRepository.find({
      where,
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async createTag(dto: CreatePptTagDto, user: AuthUser): Promise<PptTag> {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Tag name is required');
    if (dto.isSystem === true && user?.role !== 'admin') {
      throw new ForbiddenException('Only admins can create system tags');
    }
    return this.findOrCreateTag(
      name,
      dto.category || 'custom',
      dto.isSystem === true,
    );
  }

  async updateTags(
    presentationId: number,
    dto: UpdatePresentationTagsDto,
    user: AuthUser,
  ): Promise<PptTag[]> {
    await this.presentationRepository.manager.transaction(async (manager) => {
      const presentation = await manager.getRepository(Presentation).findOne({
        where: { id: presentationId, isDeleted: false },
      });
      if (!presentation)
        throw new NotFoundException(`Presentation ${presentationId} not found`);
      this.assertCanManage(presentation, user);
      await this.syncTags(presentationId, dto, manager);
    });
    return this.getTagsForPresentation(presentationId);
  }

  async generateOutline(
    dto: GeneratePresentationOutlineDto,
  ): Promise<{ outline: string }> {
    const topic = dto.topic?.trim();
    if (!topic) throw new BadRequestException('Topic is required');

    const language = dto.language === 'en' ? 'English' : 'Vietnamese';
    const slideCount = this.clampSlideCount(dto.slideCount || 8);
    const tags = this.formatTagsForPrompt(dto.tags);
    const prompt = `Create a concise slide outline for an English-learning lesson presentation.\n\nLanguage: ${language}\nTopic: ${topic}\nLesson name: ${dto.lessonName || topic}\nStudent level: ${dto.level || 'not specified'}\nTags: ${tags || 'none'}\nTarget number of slides: ${slideCount}\n\nRequirements:\n- Return only a clean markdown outline.\n- Include a cover, agenda, ${Math.max(slideCount - 3, 3)} content sections, and an ending slide.\n- Make the content practical for a teacher to use in class.\n- Do not use bold or italic markdown.`;

    try {
      const outline = await this.deepSeekService.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 2500,
        timeoutMs: 60000,
      });
      return { outline: outline.trim() };
    } catch (error) {
      throw this.deepSeekService.formatError(error);
    }
  }

  async generateSlides(dto: GeneratePresentationSlidesDto): Promise<{
    outline: string;
    slides: AIPptSlide[];
  }> {
    const outline =
      dto.outline?.trim() || (await this.generateOutline(dto)).outline;
    const topic =
      dto.topic?.trim() || dto.lessonName?.trim() || 'Lesson presentation';
    const language = dto.language === 'en' ? 'English' : 'Vietnamese';
    const tags = this.formatTagsForPrompt(dto.tags);
    const prompt = `Convert this lesson presentation outline into PPTist AIPPT JSON.\n\nLanguage: ${language}\nTopic: ${topic}\nStyle: ${dto.style || 'education'}\nTags: ${tags || 'none'}\n\nOutline:\n${outline}\n\nReturn only a valid JSON array. No markdown fences. No comments.\nEach item must match one of these shapes:\n{"type":"cover","data":{"title":"...","text":"..."}}\n{"type":"contents","data":{"items":["..."]}}\n{"type":"transition","data":{"title":"...","text":"..."}}\n{"type":"content","data":{"title":"...","items":[{"title":"...","text":"..."}]}}\n{"type":"end"}\n\nKeep each content slide to 2-4 items. Text should be short enough to fit on slides.`;

    try {
      const raw = await this.deepSeekService.generateText(prompt, {
        temperature: 0.45,
        maxTokens: 7000,
        timeoutMs: 90000,
      });
      const slides = this.parseAiSlides(raw);
      if (!slides.length)
        throw new BadRequestException('AI returned an invalid slide structure');
      return { outline, slides };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw this.deepSeekService.formatError(error);
    }
  }

  async rewriteText(
    dto: RewritePresentationTextDto,
  ): Promise<{ text: string }> {
    const content = dto.content?.trim();
    if (!content) throw new BadRequestException('Content is required');

    const language = dto.language === 'en' ? 'English' : 'Vietnamese';
    const command =
      dto.command?.trim() || 'Improve this text for a presentation slide';
    const prompt = `Rewrite the following presentation text.\n\nLanguage: ${language}\nCommand: ${command}\n\nText:\n${content}\n\nReturn only the rewritten text. Do not use markdown fences.`;

    try {
      const text = await this.deepSeekService.generateText(prompt, {
        temperature: 0.45,
        maxTokens: 1800,
        timeoutMs: 45000,
      });
      return { text: text.trim() };
    } catch (error) {
      throw this.deepSeekService.formatError(error);
    }
  }
  private async assertLessonAccess(
    lessonId: unknown,
    user: AuthUser,
  ): Promise<void> {
    const parsedLessonId = this.toNullableNumber(lessonId);
    if (!parsedLessonId) return;
    const lesson = await this.lessonRepository.findOne({
      where: { id: parsedLessonId, isDelete: false },
      relations: ['teacher'],
    });
    if (!lesson)
      throw new NotFoundException(`Lesson ${parsedLessonId} not found`);
    if (user?.role === 'admin') return;
    if (!user?.userId || lesson.teacher?.id !== user.userId) {
      throw new ForbiddenException(
        'You can only attach a PPT to your own lesson',
      );
    }
  }

  private async assertHasTags(
    presentationId: number,
    manager: EntityManager = this.presentationRepository.manager,
  ): Promise<void> {
    const count = await manager
      .getRepository(PresentationTag)
      .count({ where: { presentationId } });
    if (!count) {
      throw new BadRequestException(
        'Add at least one tag before sharing or publishing this presentation',
      );
    }
  }

  private async findOneForManage(
    id: number,
    user: AuthUser,
  ): Promise<Presentation> {
    const presentation = await this.presentationRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!presentation)
      throw new NotFoundException(`Presentation ${id} not found`);
    this.assertCanManage(presentation, user);
    return presentation;
  }

  private assertCanManage(presentation: Presentation, user: AuthUser): void {
    if (
      !user?.userId ||
      (user.role !== 'admin' && presentation.ownerId !== user.userId)
    ) {
      throw new ForbiddenException('You can only edit your own presentation');
    }
  }

  private async findActiveShare(token: string): Promise<PresentationShare> {
    const share = await this.shareRepository.findOne({
      where: { token, isActive: true },
    });
    if (!share) {
      throw new NotFoundException('Share link not found');
    }
    if (share.expiresAt && new Date(share.expiresAt).getTime() < Date.now()) {
      throw new ForbiddenException('Share link has expired');
    }
    return share;
  }

  private async normalizeContent(dto: SavePresentationDto): Promise<{
    contentJson: string | null;
    assets: NormalizedAsset[];
  }> {
    if (dto.content === undefined && dto.contentJson === undefined) {
      return { contentJson: null, assets: [] };
    }

    const content = this.parseContent(dto.content, dto.contentJson);
    this.validatePresentationContent(content);
    this.ensureContentSize(content);
    const assets: NormalizedAsset[] = [];
    const normalizedContent = await this.replaceDataUrlImages(content, assets);
    const contentJson = JSON.stringify(normalizedContent);
    this.ensureContentSize(contentJson);
    return { contentJson, assets };
  }

  private parseContent(content?: unknown, contentJson?: string): unknown {
    if (content !== undefined) return content;
    if (!contentJson) return null;
    try {
      return JSON.parse(contentJson);
    } catch (error) {
      throw new BadRequestException('Invalid presentation contentJson');
    }
  }

  private async replaceDataUrlImages(
    value: unknown,
    assets: NormalizedAsset[],
    depth = 0,
  ): Promise<unknown> {
    if (depth > 100)
      throw new BadRequestException(
        'Presentation content is too deeply nested',
      );
    if (typeof value === 'string') {
      if (value.startsWith('blob:')) {
        throw new BadRequestException(
          'Temporary browser media must be uploaded before saving',
        );
      }
      const uploaded = await this.uploadDataUrlImage(value);
      if (!uploaded) return value;
      assets.push(uploaded);
      return uploaded.url;
    }
    if (Array.isArray(value)) {
      const result = [];
      for (const item of value) {
        result.push(await this.replaceDataUrlImages(item, assets, depth + 1));
      }
      return result;
    }
    if (value && typeof value === 'object') {
      const result = {};
      for (const [key, child] of Object.entries(value)) {
        result[key] = await this.replaceDataUrlImages(child, assets, depth + 1);
      }
      return result;
    }
    return value;
  }

  private async uploadDataUrlImage(
    value: string,
  ): Promise<NormalizedAsset | null> {
    const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length) return null;

    const stored = await this.imageStorageService.store(buffer, mimeType);
    return {
      url: stored.url,
      mimeType: stored.mimeType,
      size: stored.size,
      assetType: 'image',
      originalName: 'embedded-slide-image',
      metadata: { source: 'presentation-content-data-url' },
    };
  }

  private async syncPresentationAssets(
    presentationId: number,
    assets: NormalizedAsset[],
    contentJson: string | null,
    manager: EntityManager,
  ): Promise<void> {
    const repository = manager.getRepository(PresentationAsset);
    const existing = await repository.find({ where: { presentationId } });
    const existingUrls = new Set(existing.map((asset) => asset.url));
    const records = Array.from(
      new Map(assets.map((asset) => [asset.url, asset])).values(),
    )
      .filter((asset) => !existingUrls.has(asset.url))
      .map((asset) =>
        repository.create({
          presentationId,
          assetType: asset.assetType || this.getAssetType(asset.mimeType),
          url: asset.url,
          originalName: asset.originalName || null,
          mimeType: asset.mimeType || null,
          size: asset.size || null,
          metadataJson: asset.metadata ? JSON.stringify(asset.metadata) : null,
        }),
      );
    if (records.length) await repository.save(records);

    const referencedUrls = this.collectReferencedUrls(contentJson);
    const staleIds = existing
      .filter(
        (asset) =>
          this.isEmbeddedContentAsset(asset) && !referencedUrls.has(asset.url),
      )
      .map((asset) => asset.id);
    if (staleIds.length) await repository.delete(staleIds);
  }

  private collectReferencedUrls(contentJson: string | null): Set<string> {
    const urls = new Set<string>();
    if (!contentJson) return urls;
    const visit = (value: unknown, depth = 0) => {
      if (depth > 100 || value === null || value === undefined) return;
      if (typeof value === 'string') {
        if (/^https?:\/\//i.test(value)) urls.add(value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => visit(item, depth + 1));
        return;
      }
      if (typeof value === 'object')
        Object.values(value).forEach((item) => visit(item, depth + 1));
    };
    try {
      visit(JSON.parse(contentJson));
    } catch {
      return urls;
    }
    return urls;
  }

  private isEmbeddedContentAsset(asset: PresentationAsset): boolean {
    try {
      return (
        JSON.parse(asset.metadataJson || '{}')?.source ===
        'presentation-content-data-url'
      );
    } catch {
      return false;
    }
  }

  private async syncTags(
    presentationId: number,
    dto: Pick<SavePresentationDto, 'tagIds' | 'tags'>,
    manager: EntityManager,
  ): Promise<void> {
    if (dto.tagIds === undefined && dto.tags === undefined) return;
    const repository = manager.getRepository(PresentationTag);
    const tags = await this.resolveTags(dto, manager);
    await repository.delete({ presentationId });
    if (!tags.length) return;
    await repository.save(
      tags.map((tag) => repository.create({ presentationId, tagId: tag.id })),
    );
  }

  private async resolveTags(
    dto: Pick<SavePresentationDto, 'tagIds' | 'tags'>,
    manager: EntityManager,
  ): Promise<PptTag[]> {
    const resolved = new Map<number, PptTag>();
    const tagIds = Array.isArray(dto.tagIds) ? dto.tagIds : [];
    if (tagIds.length) {
      const existing = await manager.getRepository(PptTag).findByIds(tagIds);
      for (const tag of existing.filter((item) => !item.isDeleted)) {
        resolved.set(tag.id, tag);
      }
    }

    const tags = Array.isArray(dto.tags) ? dto.tags : [];
    for (const tagInput of tags) {
      const name = typeof tagInput === 'string' ? tagInput : tagInput?.name;
      const category =
        typeof tagInput === 'string'
          ? 'custom'
          : tagInput?.category || 'custom';
      if (!name?.trim()) continue;
      const tag = await this.findOrCreateTag(
        name.trim(),
        category,
        false,
        manager,
      );
      resolved.set(tag.id, tag);
    }
    return Array.from(resolved.values());
  }

  private async findOrCreateTag(
    name: string,
    category = 'custom',
    isSystem = false,
    manager: EntityManager = this.tagRepository.manager,
  ): Promise<PptTag> {
    const repository = manager.getRepository(PptTag);
    const slug = this.slugify(`${category}-${name}`);
    const existing = await repository.findOne({ where: { slug } });
    if (existing) {
      if (existing.isDeleted) {
        existing.isDeleted = false;
        existing.name = name;
        existing.category = category;
      }
      if (isSystem && !existing.isSystem) existing.isSystem = true;
      return repository.save(existing);
    }
    return repository.save(
      repository.create({ name, slug, category, isSystem }),
    );
  }

  private async getTagsForPresentation(
    presentationId: number,
  ): Promise<PptTag[]> {
    const links = await this.presentationTagRepository.find({
      where: { presentationId },
    });
    if (!links.length) return [];
    const tags = await this.tagRepository.findByIds(
      links.map((link) => link.tagId),
    );
    return tags
      .filter((tag) => !tag.isDeleted)
      .sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) return categoryCompare;
        return a.name.localeCompare(b.name);
      });
  }

  private async copyTags(
    sourcePresentationId: number,
    targetPresentationId: number,
    manager: EntityManager,
  ) {
    const repository = manager.getRepository(PresentationTag);
    const sourceLinks = await repository.find({
      where: { presentationId: sourcePresentationId },
    });
    if (!sourceLinks.length) return;
    await repository.save(
      sourceLinks.map((link) =>
        repository.create({
          presentationId: targetPresentationId,
          tagId: link.tagId,
        }),
      ),
    );
  }

  private parseAiSlides(raw: string): AIPptSlide[] {
    const cleaned = raw
      .replace(/```jsonl?/gi, '')
      .replace(/```/g, '')
      .trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) return [];

    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((slide) => this.isValidAiSlide(slide));
    } catch (error) {
      return [];
    }
  }

  private isValidAiSlide(slide: any): slide is AIPptSlide {
    if (!slide || typeof slide !== 'object') return false;
    if (slide.type === 'end') return true;
    if (slide.type === 'cover' || slide.type === 'transition') {
      return (
        typeof slide.data?.title === 'string' &&
        typeof slide.data?.text === 'string'
      );
    }
    if (slide.type === 'contents') {
      return (
        Array.isArray(slide.data?.items) &&
        slide.data.items.every((item: unknown) => typeof item === 'string')
      );
    }
    if (slide.type === 'content') {
      return (
        typeof slide.data?.title === 'string' &&
        Array.isArray(slide.data?.items) &&
        slide.data.items.every(
          (item: any) =>
            item &&
            typeof item.title === 'string' &&
            typeof item.text === 'string',
        )
      );
    }
    return false;
  }

  private buildFallbackSlides(topic: string, outline: string): AIPptSlide[] {
    const lines = outline
      .split('\n')
      .map((line) => line.replace(/^[-#\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 8);
    const agenda = lines.length
      ? lines.slice(0, 5)
      : ['Warm up', 'Key vocabulary', 'Practice', 'Wrap up'];
    const contentLines = lines.length ? lines : agenda;

    return [
      { type: 'cover', data: { title: topic, text: 'Lesson presentation' } },
      { type: 'contents', data: { items: agenda } },
      ...contentLines.slice(0, 5).map(
        (line): AIPptSlide => ({
          type: 'content',
          data: {
            title: line,
            items: [
              { title: 'Goal', text: `Understand and use: ${line}` },
              {
                title: 'Practice',
                text: 'Ask students to answer, compare, and explain.',
              },
              {
                title: 'Check',
                text: 'Review one example together before moving on.',
              },
            ],
          },
        }),
      ),
      { type: 'end' },
    ];
  }

  private formatTagsForPrompt(
    tags?: Array<string | { name: string; category?: string }>,
  ): string {
    if (!Array.isArray(tags)) return '';
    return tags
      .map((tag) =>
        typeof tag === 'string' ? tag : `${tag.category || 'tag'}:${tag.name}`,
      )
      .filter(Boolean)
      .join(', ');
  }

  private clampSlideCount(count: number): number {
    if (!Number.isFinite(count)) return 8;
    return Math.max(4, Math.min(20, Math.round(count)));
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }

  private validatePresentationContent(content: unknown): void {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      throw new BadRequestException('Presentation content must be an object');
    }
    const slides = (content as { slides?: unknown }).slides;
    if (!Array.isArray(slides) || !slides.length) {
      throw new BadRequestException(
        'Presentation content must contain at least one slide',
      );
    }
    if (slides.length > 100) {
      throw new BadRequestException(
        'Presentation cannot contain more than 100 slides',
      );
    }
  }

  private ensureContentSize(content: unknown): void {
    const bytes = Buffer.byteLength(
      typeof content === 'string' ? content : JSON.stringify(content),
      'utf8',
    );
    const maxBytes = Number(
      process.env.PRESENTATION_MAX_CONTENT_BYTES || 25 * 1024 * 1024,
    );
    if (bytes > maxBytes) {
      throw new BadRequestException('Presentation content is too large');
    }
  }

  private toFutureDate(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      throw new BadRequestException('Share expiry must be a valid future date');
    }
    return date;
  }

  private stringifyJson(value?: unknown, rawJson?: string): string {
    if (rawJson !== undefined) {
      if (!rawJson) return null;
      try {
        JSON.parse(rawJson);
      } catch (error) {
        throw new BadRequestException('Invalid metadataJson');
      }
      return rawJson;
    }
    if (value === undefined || value === null) return null;
    return JSON.stringify(value);
  }

  private getFileBuffer(file: Express.Multer.File): Buffer {
    if (file.buffer) return file.buffer;
    throw new BadRequestException('Uploaded file buffer is missing');
  }

  private getAssetType(mimeType?: string): string {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }

  private toNullableNumber(value: unknown): number {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private createShareToken(): string {
    return randomBytes(32).toString('base64url');
  }
}
