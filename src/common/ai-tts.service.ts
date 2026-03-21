import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const execFileAsync = promisify(execFile);

@Injectable()
export class AiTtsService {
  private readonly logger = new Logger(AiTtsService.name);
  private readonly pythonBin = process.env.TTS_PYTHON_BIN?.trim() || 'python';
  private readonly workerScriptPath =
    process.env.TTS_WORKER_SCRIPT?.trim() ||
    path.join(process.cwd(), 'scripts', 'tts_worker.py');
  private readonly outputDir = path.join(process.cwd(), 'uploads');
  private readonly defaultVoice = process.env.TTS_EDGE_VOICE?.trim() || 'en-US-JennyNeural';
  private readonly defaultLang = process.env.TTS_GTTS_LANG?.trim() || 'en';
  private readonly defaultRate = process.env.TTS_EDGE_RATE?.trim() || '+0%';
  private readonly ttsProcessTimeoutMs = Number(process.env.TTS_PROCESS_TIMEOUT_MS || 90000);
  private readonly baseUrl = process.env.API_BASE_URL || 'https://api.happyclass.com.vn';

  private warnedMissingWorker = false;

  private ensureWorkerAvailable(): boolean {
    const exists = fs.existsSync(this.workerScriptPath);
    if (!exists && !this.warnedMissingWorker) {
      this.logger.error(`TTS worker script not found at: ${this.workerScriptPath}`);
      this.warnedMissingWorker = true;
    }
    return exists;
  }

  isProviderReady(): { ok: boolean; detail?: string } {
    if (!this.ensureWorkerAvailable()) {
      return { ok: false, detail: `Worker script not found: ${this.workerScriptPath}` };
    }

    return { ok: true };
  }

  async synthesizeToAudioUrl(
    text: string,
    options?: {
      voiceId?: string;
      language?: string;
      provider?: 'auto' | 'edge' | 'gtts';
      outputFormat?: 'mp3' | 'wav' | 'ogg' | 'flac' | 'mulaw';
    },
  ): Promise<string | null> {
    const safeText = (text || '').trim();
    if (!safeText) {
      return null;
    }

    if (!this.ensureWorkerAvailable()) {
      return null;
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const extension = options?.outputFormat === 'wav' ? 'wav' : 'mp3';
    const fileName = `tts-${randomUUID()}.${extension}`;
    const outputPath = path.join(this.outputDir, fileName);

    const args = [
      this.workerScriptPath,
      '--text',
      safeText,
      '--output',
      outputPath,
      '--provider',
      options?.provider || 'auto',
      '--voice',
      options?.voiceId || this.defaultVoice,
      '--lang',
      options?.language || this.defaultLang,
      '--rate',
      this.defaultRate,
    ];

    try {
      const { stdout, stderr } = await execFileAsync(this.pythonBin, args, {
        timeout: this.ttsProcessTimeoutMs,
      });

      if (stderr?.trim()) {
        this.logger.warn(`TTS worker stderr: ${stderr.trim()}`);
      }

      if (stdout?.trim()) {
        this.logger.debug(`TTS worker output: ${stdout.trim()}`);
      }

      if (fs.existsSync(outputPath)) {
        return `${this.baseUrl}/uploads/${fileName}`;
      }

      this.logger.warn('TTS worker finished but output file was not created');
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown TTS worker error';
      this.logger.error(`Local TTS generation failed: ${message}`);
      return null;
    }
  }
}
