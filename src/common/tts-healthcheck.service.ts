import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HomeWorkService } from '../homeWork/homeWork.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class TtsHealthcheckService {
  private readonly logger = new Logger(TtsHealthcheckService.name);
  private consecutiveFailures = 0;
  private readonly maxFailuresBeforeRestart = 2;

  constructor(private readonly homeWorkService: HomeWorkService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkTtsHealth() {
    try {
      // Gọi getTtsHealth() — check cả local provider + Flask app
      const health = await this.homeWorkService.getTtsHealth();

      if (health.ok) {
        if (this.consecutiveFailures > 0) {
          this.logger.log(
            `TTS service recovered (${health.baseUrl})`,
          );
        }
        this.consecutiveFailures = 0;
        return;
      }

      this.consecutiveFailures++;
      this.logger.warn(
        `TTS health check failed (${this.consecutiveFailures}/${this.maxFailuresBeforeRestart}): [${health.baseUrl}] ${health.detail || 'Unknown'}`,
      );

      if (this.consecutiveFailures >= this.maxFailuresBeforeRestart) {
        await this.restartTtsService();
        this.consecutiveFailures = 0;
      }
    } catch (error) {
      this.consecutiveFailures++;
      this.logger.error(`TTS health check error: ${error.message}`);
    }
  }

  private async restartTtsService() {
    this.logger.warn('Attempting to restart TTS Flask app...');

    const restartCmd = process.env.TTS_RESTART_CMD;
    if (!restartCmd) {
      this.logger.warn(
        'TTS_RESTART_CMD not configured in .env. ' +
          'Set it to enable auto-restart (e.g. TTS_RESTART_CMD=/home/tts_stt_flask_app/restart_tts.sh)',
      );
      return;
    }

    try {
      const { stdout, stderr } = await execAsync(restartCmd, {
        timeout: 30000,
      });
      if (stdout) this.logger.log(`TTS restart stdout: ${stdout.trim()}`);
      if (stderr) this.logger.warn(`TTS restart stderr: ${stderr.trim()}`);
      this.logger.log('TTS Flask app restart command executed successfully');
    } catch (error) {
      this.logger.error(`Failed to restart TTS Flask app: ${error.message}`);
    }
  }
}
