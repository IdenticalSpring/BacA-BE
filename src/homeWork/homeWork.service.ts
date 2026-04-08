import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HomeWork } from './homeWork.entity';
import {
  CreateHomeWorkDto,
  findHomeWorkByLevelAndTeacherIdDto,
  ReassignHomeWorksDto,
  textToSpeechDto,
  UpdateHomeWorkDto,
} from './homeWork.dto';
import * as dotenv from 'dotenv';
import { Teacher } from 'src/teacher/teacher.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import axios from 'axios';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';
import { AiTtsService } from 'src/common/ai-tts.service';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();
@Injectable()
export class HomeWorkService {
  private readonly logger = new Logger(HomeWorkService.name);
  private readonly ttsBaseUrls = this.buildTtsBaseUrls();
  private readonly defaultVoice = 'en-US-JennyNeural';
  private readonly defaultVoiceSpeed = '0.8';
  private readonly ttsRequestTimeoutMs = Number(process.env.TTS_REQUEST_TIMEOUT_MS || 45000);
  private readonly ttsVoicesTimeoutMs = Number(process.env.TTS_VOICES_TIMEOUT_MS || 15000);
  private readonly ttsRetryCount = Number(process.env.TTS_RETRY_COUNT || 1);
  private readonly ttsUseCustomServerFirst =
    (process.env.TTS_USE_CUSTOM_SERVER_FIRST || 'false').toLowerCase() === 'true';
  private readonly ttsCacheTtlMs = Number(process.env.TTS_CACHE_TTL_MS || 3600000);
  private readonly ttsCacheMaxEntries = Number(process.env.TTS_CACHE_MAX_ENTRIES || 500);
  private readonly ttsCache = new Map<string, { audioBase64: string; expiresAt: number }>();

  constructor(
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(LessonBySchedule)
    private readonly lessonByScheduleRepository: Repository<LessonBySchedule>,
    private readonly aiTtsService: AiTtsService,
  ) {}

  private buildTtsBaseUrls(): string[] {
    const configuredUrls = (
      process.env.TTS_BASE_URLS || process.env.TTS_BASE_URL || ''
    )
      .split(',')
      .map((item) => item.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    const defaults = ['http://localhost:5000', 'http://45.13.132.111:5000'];
    return Array.from(new Set([...configuredUrls, ...defaults]));
  }

  private isRetryableTtsError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const retryableCodes = ['ETIMEDOUT', 'ECONNABORTED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'];
    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }

    const status = error.response?.status;
    return typeof status === 'number' && status >= 500;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractTtsErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const status = error.response?.status;

      if (typeof responseData === 'string' && responseData.trim()) {
        return responseData;
      }

      if (responseData && typeof responseData === 'object') {
        const messageCandidates = [
          (responseData as Record<string, unknown>).message,
          (responseData as Record<string, unknown>).error,
          (responseData as Record<string, unknown>).detail,
          (responseData as Record<string, unknown>).reason,
          (responseData as Record<string, unknown>).mess,
          (responseData as Record<string, unknown>).msg,
        ];

        for (const candidate of messageCandidates) {
          if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
          }
        }
      }

      if (status) {
        return `Upstream TTS responded with status ${status}`;
      }

      if (error.code) {
        return `Upstream TTS network error (${error.code})`;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Unknown TTS error';
  }

  private buildTtsAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey =
      process.env.TTS_API_KEY?.trim() ||
      process.env.HUGGING_FACE_API_KEY?.trim() ||
      process.env.HUGGINGFACE_API_KEY?.trim() ||
      process.env.TTS_HF_KEY?.trim();

    if (!apiKey) {
      return headers;
    }

    const headerName = (process.env.TTS_API_KEY_HEADER || 'Authorization').trim();
    const prefix = process.env.TTS_API_KEY_PREFIX ?? 'Bearer';
    headers[headerName] = prefix ? `${prefix} ${apiKey}` : apiKey;
    return headers;
  }

  private getPrimaryTtsBaseUrl(): string {
    return this.ttsBaseUrls[0] || 'http://45.13.132.111:5000';
  }

  private resolveRequestedVoice(voice?: string): string {
    if (typeof voice !== 'string') {
      return this.defaultVoice;
    }

    const normalizedVoice = voice.trim();
    if (!normalizedVoice) {
      return this.defaultVoice;
    }

    if (/^\d+$/.test(normalizedVoice)) {
      return this.defaultVoice;
    }

    return normalizedVoice;
  }

  private getTtsCacheKey(text: string, voice: string): string {
    return `${voice}::${text.trim()}`;
  }

  private getCachedTtsAudio(cacheKey: string): string | null {
    const cached = this.ttsCache.get(cacheKey);
    if (!cached) {
      return null;
    }

    if (Date.now() >= cached.expiresAt) {
      this.ttsCache.delete(cacheKey);
      return null;
    }

    return cached.audioBase64;
  }

  private setCachedTtsAudio(cacheKey: string, audioBase64: string): void {
    if (this.ttsCache.size >= this.ttsCacheMaxEntries) {
      const oldestKey = this.ttsCache.keys().next().value;
      if (oldestKey) {
        this.ttsCache.delete(oldestKey);
      }
    }

    this.ttsCache.set(cacheKey, {
      audioBase64,
      expiresAt: Date.now() + this.ttsCacheTtlMs,
    });
  }

  private extractAudioPayload(responseData: unknown): string | null {
    if (!responseData) {
      return null;
    }

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (typeof responseData === 'object') {
      const data = responseData as Record<string, unknown>;
      const candidates = [
        data.audioData,
        data.url,
        data.audio_url,
        data.audioUrl,
        data.result,
      ];

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }
      }
    }

    return null;
  }

  private async requestTtsAudioFromCustomServer(
    baseUrl: string,
    textToSpeechDto: textToSpeechDto,
    resolvedVoice: string,
  ): Promise<string> {
    const maxAttempts = Math.max(1, this.ttsRetryCount + 1);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const headers = this.buildTtsAuthHeaders();
        const response = await axios.post(
          `${baseUrl}/tts`,
          {
            text: textToSpeechDto.textToSpeech,
            voice: resolvedVoice,
            voiceSpeed: textToSpeechDto.voiceSpeed ?? this.defaultVoiceSpeed,
          },
          {
            headers,
            timeout: this.ttsRequestTimeoutMs,
          },
        );

        const audioPayload = this.extractAudioPayload(response?.data);
        if (!audioPayload) {
          throw new BadGatewayException('TTS response missing audio payload');
        }

        return audioPayload;
      } catch (error) {
        const canRetry = attempt < maxAttempts && this.isRetryableTtsError(error);
        if (!canRetry) {
          throw error;
        }

        this.logger.warn(
          `Retrying TTS request ${attempt}/${maxAttempts - 1} for ${baseUrl}/tts due to transient error`,
        );
        await this.delay(300 * attempt);
      }
    }

    throw new ServiceUnavailableException(`TTS request failed after ${maxAttempts} attempts`);
  }

  private async requestTtsAudioFromLocalProvider(
    textToSpeechDto: textToSpeechDto,
    resolvedVoice: string,
  ): Promise<string> {
    const localAudioUrl = await this.aiTtsService.synthesizeToAudioUrl(
      textToSpeechDto.textToSpeech,
      {
        outputFormat: 'mp3',
        provider: 'auto',
        voiceId: resolvedVoice,
      },
    );

    if (!localAudioUrl) {
      throw new Error('Local TTS provider did not return audio URL');
    }

    const fileName = localAudioUrl.split('/').pop();
    if (fileName) {
      const localPath = path.join(process.cwd(), 'uploads', fileName);
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        return fileBuffer.toString('base64');
      }
    }

    const response = await axios.get(localAudioUrl, {
      responseType: 'arraybuffer',
      timeout: this.ttsRequestTimeoutMs,
    });

    return Buffer.from(response.data).toString('base64');
  }

  async findAll(): Promise<HomeWork[]> {
    return await this.homeWorkRepository.find({
      where: { isDelete: false },
      relations: ['teacher', 'vocabularies'],
    });
  }
  async findHomeWorkByLevelAndTeacherId(
    findHomeWorkByLevelAndTeacherId: findHomeWorkByLevelAndTeacherIdDto,
  ): Promise<HomeWork[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: findHomeWorkByLevelAndTeacherId.teacherId },
    });
    return await this.homeWorkRepository.find({
      where: {
        level: findHomeWorkByLevelAndTeacherId.level,
        teacher,
        isDelete: false,
      },
      relations: ['teacher', 'vocabularies'],
    });
  }
  async findHomeWorkByTeacherId(teacherId: number): Promise<HomeWork[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: teacherId },
    });
    return await this.homeWorkRepository.find({
      where: {
        teacher,
        isDelete: false,
      },
      relations: ['teacher', 'vocabularies'],
    });
  }
  async findOne(id: number): Promise<HomeWork> {
    const homeWork = await this.homeWorkRepository.findOne({
      where: { id, isDelete: false },
      relations: ['teacher', 'vocabularies'],
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    return homeWork;
  }

  async create(createHomeWorkDto: CreateHomeWorkDto): Promise<HomeWork> {
    const { teacherId, ...rest } = createHomeWorkDto;
    // console.log('createHomeWorkDto', createHomeWorkDto);

    // Tìm teacher theo ID
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDelete: false },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Tạo class và gán teacher
    const homeWorkEntity = this.homeWorkRepository.create({
      ...rest,
      teacher, // Gán trực tiếp teacher vào entity
    });

    return await this.homeWorkRepository.save(homeWorkEntity);
  }

  async reassignHomeWorks(
    reassignDto: ReassignHomeWorksDto,
  ): Promise<{ updatedCount: number }> {
    const { newTeacherId, homeWorkIds } = reassignDto;

    if (!homeWorkIds || homeWorkIds.length === 0) {
      return { updatedCount: 0 };
    }

    const newTeacher = await this.teacherRepository.findOne({
      where: { id: newTeacherId, isDelete: false },
    });

    if (!newTeacher) {
      throw new NotFoundException(
        `New teacher with ID ${newTeacherId} not found.`,
      );
    }

    const updateResult = await this.homeWorkRepository.update(
      { id: In(homeWorkIds) }, // Điều kiện: id nằm trong mảng homeWorkIds
      { teacher: newTeacher },
    );

    return { updatedCount: updateResult.affected };
  }

  async update(
    id: number,
    updateHomeWorkDto: UpdateHomeWorkDto,
  ): Promise<HomeWork> {
    const { teacherId, ...rest } = updateHomeWorkDto;
    // Tìm class cần update
    const homeWorkEntity = await this.findOne(id);
    if (!homeWorkEntity) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    if (teacherId !== undefined) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
      }

      homeWorkEntity.teacher = teacher;
    }

    // Cập nhật các field còn lại
    Object.assign(homeWorkEntity, rest);

    return await this.homeWorkRepository.save(homeWorkEntity);
  }
  async remove(id: number): Promise<void> {
    // const result = await this.homeWorkRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`HomeWork with ID ${id} not found`);
    // }
    const homeWork = await this.homeWorkRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    const lessonBySchedule = await this.lessonByScheduleRepository.find({
      where: { homeWorkId: homeWork.id },
    });
    if (lessonBySchedule.length > 0) {
      // console.log('lessonBySchedule', lessonBySchedule);
      const data = await Promise.all(
        lessonBySchedule.map((lesson) => {
          lesson.homeWorkId = null;
          lesson.isHomeWorkSent = false;
          return lesson;
        }),
      );
      await this.lessonByScheduleRepository.save(data);
    }
    homeWork.isDelete = true;
    await this.homeWorkRepository.save(homeWork);
  }
  // async textToSpeech(textToSpeechDto: textToSpeechDto): Promise<string> {
  //   try {
  //     const response = await axios.post(
  //       'https://ttsfree.com/api/v1/tts',
  //       {
  //         text: textToSpeechDto.textToSpeech,
  //         voiceService: 'servicebin',
  //         voiceID: textToSpeechDto.gender ? 'en-US4' : 'en-US',
  //         voiceSpeed: '0',
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           apikey: process.env.API_TTS_KEY,
  //         },
  //       },
  //     );
  //     console.log(response.data);

  //     return response.data.audioData; // Trả về buffer
  //   } catch (error) {
  //     console.error('Error converting text to speech:', error);
  //     throw new Error('TTS conversion failed');
  //   }
  // }
  async textToSpeech(textToSpeechDto: textToSpeechDto): Promise<string> {
    try {
      const safeText = textToSpeechDto?.textToSpeech?.trim();
      if (!safeText) {
        throw new ServiceUnavailableException('TTS conversion failed: textToSpeech is empty');
      }

      const resolvedVoice = this.resolveRequestedVoice(textToSpeechDto.voice);
      const cacheKey = this.getTtsCacheKey(safeText, resolvedVoice);
      const cachedAudio = this.getCachedTtsAudio(cacheKey);
      if (cachedAudio) {
        return cachedAudio;
      }

      const errors: string[] = [];

      const runLocalProvider = async (): Promise<string | null> => {
        try {
          const audio = await this.requestTtsAudioFromLocalProvider(
            { ...textToSpeechDto, textToSpeech: safeText, voice: resolvedVoice },
            resolvedVoice,
          );
          this.setCachedTtsAudio(cacheKey, audio);
          return audio;
        } catch (localError) {
          const localMessage = this.extractTtsErrorMessage(localError);
          errors.push(`local(edge-tts/gTTS) => ${localMessage}`);
          this.logger.error(`Error converting text to speech via local provider: ${localMessage}`);
          return null;
        }
      };

      const runCustomServers = async (): Promise<string | null> => {
        for (const baseUrl of this.ttsBaseUrls) {
          try {
            const audio = await this.requestTtsAudioFromCustomServer(
              baseUrl,
              { ...textToSpeechDto, textToSpeech: safeText, voice: resolvedVoice },
              resolvedVoice,
            );
            this.setCachedTtsAudio(cacheKey, audio);
            return audio;
          } catch (error) {
            const message = this.extractTtsErrorMessage(error);
            errors.push(`${baseUrl}/tts => ${message}`);
            this.logger.error(`Error converting text to speech via ${baseUrl}/tts: ${message}`);
          }
        }

        return null;
      };

      const firstAttempt = this.ttsUseCustomServerFirst
        ? await runCustomServers()
        : await runLocalProvider();

      if (firstAttempt) {
        return firstAttempt;
      }

      const secondAttempt = this.ttsUseCustomServerFirst
        ? await runLocalProvider()
        : await runCustomServers();

      if (secondAttempt) {
        return secondAttempt;
      }

      throw new ServiceUnavailableException(`TTS conversion failed: ${errors.join(' | ')}`);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      const message = this.extractTtsErrorMessage(error);
      this.logger.error(`Unexpected TTS runtime error: ${message}`);
      throw new ServiceUnavailableException(`TTS conversion failed: ${message}`);
    }
  }
  async voices(): Promise<any> {
    const localProviderHealth = this.aiTtsService.isProviderReady();
    if (localProviderHealth.ok && !this.ttsUseCustomServerFirst) {
      return [this.defaultVoice];
    }

    const voiceErrors: string[] = [];

    for (const baseUrl of this.ttsBaseUrls) {
      try {
        const headers = this.buildTtsAuthHeaders();
        const response = await axios.get(`${baseUrl}/voices`, {
          headers,
          timeout: this.ttsVoicesTimeoutMs,
        });

        if (Array.isArray(response?.data?.voices) && response.data.voices.length) {
          return response.data.voices;
        }

        this.logger.warn(
          `TTS voices response invalid from ${baseUrl}/voices. Trying next endpoint...`,
        );
      } catch (error) {
        const message = this.extractTtsErrorMessage(error);
        voiceErrors.push(`${baseUrl}/voices => ${message}`);
        this.logger.error(`Get voices TTS failed via ${baseUrl}/voices: ${message}`);
      }
    }

    if (voiceErrors.length) {
      this.logger.warn(`All TTS voices endpoints failed: ${voiceErrors.join(' | ')}`);
    }

    return [this.defaultVoice];
  }

  async getTtsHealth(): Promise<{ baseUrl: string; ok: boolean; detail?: string }> {
    const primaryUrl = this.getPrimaryTtsBaseUrl();
    const localProviderHealth = this.aiTtsService.isProviderReady();

    if (localProviderHealth.ok) {
      return {
        baseUrl: 'local(edge-tts/gTTS)',
        ok: true,
      };
    }

    try {
      const headers = this.buildTtsAuthHeaders();
      const response = await axios.get(`${primaryUrl}/voices`, {
        headers,
        timeout: this.ttsVoicesTimeoutMs,
      });
      const ok = Array.isArray(response?.data?.voices);
      return { baseUrl: primaryUrl, ok, detail: ok ? undefined : 'Invalid voices payload' };
    } catch (error) {
      const message = this.extractTtsErrorMessage(error);
      return { baseUrl: primaryUrl, ok: false, detail: message };
    }
  }
}
