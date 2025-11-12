// src/common/gemini-key-rotator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

type Milli = number;

export class GeminiKeyRotator {
  private keys: string[] = [];
  private i = 0;
  private cooldownMs: Milli;
  private coolUntil: Map<string, number> = new Map();

  constructor(options?: { cooldownMs?: Milli }) {
    // Gather keys from either GEMINI_API_KEYS (comma list) or GEMINI_KEY1..5
    const listFromSingle = (process.env.GEMINI_API_KEYS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const listFromIndexed = [
      process.env.GEMINI_KEY1,
      process.env.GEMINI_KEY2,
      process.env.GEMINI_KEY3,
      process.env.GEMINI_KEY4,
      process.env.GEMINI_KEY5,
    ].filter(Boolean) as string[];

    this.keys = (listFromSingle.length ? listFromSingle : listFromIndexed).filter(Boolean);

    if (this.keys.length === 0) {
      throw new Error(
        'No Gemini API keys configured. Set GEMINI_API_KEYS or GEMINI_KEY1..GEMINI_KEY5.'
      );
    }

    // default cooldown 90s for a key that hit 429/503
    this.cooldownMs = options?.cooldownMs ?? 90_000;
  }

  /** Pick the next non-cooled key (round-robin). Throws if all are cooling. */
  nextKey(): string {
    const n = this.keys.length;
    const now = Date.now();

    for (let tries = 0; tries < n; tries++) {
      const k = this.keys[this.i];
      this.i = (this.i + 1) % n;

      const until = this.coolUntil.get(k) || 0;
      if (now >= until) return k;
    }
    throw new Error('All Gemini API keys are cooling down. Please wait or add more keys.');
  }

  /** Mark a key as cooling down (e.g., after 429 or 503). */
  coolDown(key: string, ms = this.cooldownMs) {
    this.coolUntil.set(key, Date.now() + ms);
  }

  /** Helper to run a Gemini call with automatic key rotation + retries. */
  async generateWithRotation(opts: {
    model: string;
    contents: any;
    maxAttempts?: number;     // default keys.length * 2
    temperature?: number;
  }): Promise<string> {
    const {
      model,
      contents,
      temperature = 0.7,
      maxAttempts = this.keys.length * 2,
    } = opts;

    let lastErr: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const key = this.nextKey();

      try {
        const genAI = new GoogleGenerativeAI(key);
        const mdl = genAI.getGenerativeModel({ model, generationConfig: { temperature } });

        const result = await mdl.generateContent({ contents });
        const text = (await result.response.text()).trim();
        if (!text) throw new Error('Empty response from Gemini');

        return text;
      } catch (err: any) {
        lastErr = err;

        const status = err?.status ?? err?.response?.status;
        const msg = (err?.message || '').toLowerCase();

        const rateLimited =
          status === 429 ||
          status === 503 ||
          msg.includes('rate') ||
          msg.includes('quota') ||
          msg.includes('resource has been exhausted') ||
          msg.includes('unavailable');

        // Put this key on cooldown and try the next one
        if (rateLimited) {
          this.coolDown(key);
        } else {
          // Non-rate-limit error: still try next key once, then propagate if it keeps failing
          // (keeping behavior simple: just continue loop)
        }
      }
    }

    throw lastErr ?? new Error('Gemini call failed after rotating through keys.');
  }
}
