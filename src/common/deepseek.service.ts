import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type GenerateTextOptions = {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

@Injectable()
export class DeepSeekService {
  private readonly baseUrl =
    process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  private readonly model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  private readonly apiKey = process.env.DEEPSEEK_API_KEY || '';

  isConfigured(): boolean {
    return this.apiKey.trim().length > 0;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      baseUrl: this.baseUrl,
      model: this.model,
    };
  }

  async generateText(
    prompt: string,
    options: GenerateTextOptions = {},
  ): Promise<string> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  async generateChat(
    messages: DeepSeekMessage[],
    options: GenerateTextOptions = {},
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const timeoutMs = options.timeoutMs ?? 60000;
    const response = await axios.post(
      `${this.baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 8192,
      },
      {
        timeout: timeoutMs,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('DeepSeek returned an empty response');
    }

    return text;
  }

  formatError(error: unknown): Error {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const providerMessage =
      axiosError.response?.data?.error?.message ||
      axiosError.response?.data?.message ||
      (error as Error)?.message ||
      'Unknown error';

    if (status === 401 || status === 403) {
      return new Error('DeepSeek API key is invalid or unauthorized');
    }

    if (status === 429) {
      return new Error('DeepSeek rate limit reached. Please try again later.');
    }

    if (status >= 500) {
      return new Error('DeepSeek service is temporarily unavailable.');
    }

    if (providerMessage.toLowerCase().includes('timeout')) {
      return new Error('DeepSeek request timed out. Please try again.');
    }

    return new Error(`DeepSeek request failed: ${providerMessage}`);
  }
}
