import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentPage } from 'src/contentpage/contentpage.entity';
import axios from 'axios';
import { ChatTopic } from 'src/chat-topic/chat-topic.entity';
import { ChatService } from 'src/chat/chat.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private keyFailureCounts: Map<string, number> = new Map();
  private keyUsageCounts: Map<string, number> = new Map(); // Track usage for load balancing
  private readonly MAX_FAILURES_PER_KEY = 3;
  private readonly PROACTIVE_ROTATION_THRESHOLD = 3; // Rotate after N successful requests

  constructor(
    @InjectRepository(ContentPage)
    private contentPageRepository: Repository<ContentPage>,
    @InjectRepository(ChatTopic)
    private chatTopicRepository: Repository<ChatTopic>, 

    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService, 
    
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {
    // Load all available API keys from .env
    this.apiKeys = [
      process.env.GEMINI_KEY1,
      process.env.GEMINI_KEY2,
      process.env.GEMINI_KEY3,
      process.env.GEMINI_KEY4,
      process.env.GEMINI_KEY5,
      process.env.GEMINI_KEY6,
      process.env.GEMINI_KEY7,
      process.env.GEMINI_KEY8,
      process.env.GEMINI_KEY9,
      process.env.GEMINI_KEY10,
    ].filter(key => key && key.trim().length > 0); // Only use valid keys

    if (this.apiKeys.length === 0) {
      throw new Error('No valid GEMINI_KEY found in environment variables');
    }
    
    // Initialize with first key
    this.genAI = new GoogleGenerativeAI(this.apiKeys[0]);
  }

  /**
   * Rotate to next available API key
   * Uses round-robin with least-used-first strategy
   */
  private rotateApiKey(): void {
    const startIndex = this.currentKeyIndex;
    let attempts = 0;

    // Try to find a key that hasn't failed too many times
    while (attempts < this.apiKeys.length) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      const currentKey = this.apiKeys[this.currentKeyIndex];
      const failures = this.keyFailureCounts.get(currentKey) || 0;

      if (failures < this.MAX_FAILURES_PER_KEY) {
        this.genAI = new GoogleGenerativeAI(currentKey);
        console.log(`🔄 Rotated to API key #${this.currentKeyIndex + 1} (failures: ${failures})`);
        return;
      }

      attempts++;
    }

    // If all keys have failed, reset failure counts and use next key
    console.warn('⚠️ All API keys have failed. Resetting failure counts...');
    this.keyFailureCounts.clear();
    this.currentKeyIndex = (startIndex + 1) % this.apiKeys.length;
    this.genAI = new GoogleGenerativeAI(this.apiKeys[this.currentKeyIndex]);
  }

  /**
   * Proactively rotate key for load balancing
   */
  private proactiveRotate(): void {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    const usageCount = this.keyUsageCounts.get(currentKey) || 0;

    if (usageCount >= this.PROACTIVE_ROTATION_THRESHOLD) {
      console.log(`🔄 Proactive rotation triggered after ${usageCount} uses`);
      this.rotateApiKey();
      this.keyUsageCounts.set(currentKey, 0); // Reset count for old key
    }
  }

  /**
   * Increment usage counter for current key
   */
  private incrementKeyUsage(): void {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    const currentCount = this.keyUsageCounts.get(currentKey) || 0;
    this.keyUsageCounts.set(currentKey, currentCount + 1);
  }

  /**
   * Mark current key as failed (for quota/rate limit errors)
   */
  private markCurrentKeyAsFailed(): void {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    const failures = (this.keyFailureCounts.get(currentKey) || 0) + 1;
    this.keyFailureCounts.set(currentKey, failures);
  }

  private guessMimeFromUrl(url: string): string {
    const ext = (url.split("?")[0].split(".").pop() || "").toLowerCase();
    const map: Record<string, string> = {
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
      mp4: "audio/mp4",
      wav: "audio/wav",
      webm: "audio/webm",
      ogg: "audio/ogg",
      flac: "audio/flac",
      aac: "audio/aac",
    };
    return map[ext] || "application/octet-stream";
  }

  private enforceSingleQuestionReply(text: string): string {
    const normalized = (text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return 'That sounds good. Can you tell me a bit more?';
    }

    const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
    const output: string[] = [];
    let questionUsed = false;

    for (const rawSentence of sentences) {
      const sentence = rawSentence.trim();
      if (!sentence) {
        continue;
      }

      if (sentence.includes('?')) {
        if (!questionUsed) {
          const firstQuestionPart = sentence.split('?')[0].trim();
          if (firstQuestionPart) {
            output.push(`${firstQuestionPart}?`);
            questionUsed = true;
          }
        }
        continue;
      }

      output.push(sentence);
    }

    if (!questionUsed) {
      output.push('Can you tell me a bit more?');
    }

    return output.join(' ').replace(/\s+/g, ' ').trim();
  }

  async enhanceDescription(description: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error;

    // Proactive rotation for load balancing
    this.proactiveRotate();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        });

        // Lấy prompt từ ContentPage
        const contentPage = await this.contentPageRepository.findOne({
          where: { id: 1 },
        });
        const defaultPrompt = `create lesson content in detail for this english lesson, its topic and requirements as follow:${description}. Return result without bold or italic`;
        const prompt = contentPage?.promptDescription || defaultPrompt;

        // Timeout protection
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000);
        });

        const generatePromise = model.generateContent(prompt)
          .then((result) => result.response.text());

        const result = await Promise.race([generatePromise, timeoutPromise]);
        
        // Success - increment usage and return
        this.incrementKeyUsage();
        console.log(`✅ enhanceDescription successful with key #${this.currentKeyIndex + 1}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`❌ enhanceDescription attempt ${attempt + 1} failed:`, error.message);

        // Handle quota/rate limit errors
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
          this.markCurrentKeyAsFailed();
          
          if (this.apiKeys.length > 1 && attempt < maxRetries - 1) {
            console.log(`🔄 Rotating to next key due to quota limit...`);
            this.rotateApiKey();
            continue; // Retry with new key
          }
        }

        // Handle overload errors with exponential backoff
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          if (attempt < maxRetries - 1) {
            const delayMs = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Waiting ${delayMs}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
        }

        // If not retryable error, throw immediately
        if (attempt === maxRetries - 1) {
          throw this.formatError(error);
        }
      }
    }

    throw this.formatError(lastError);
  }

  async enhanceLessonPlan(
    lessonPlan: string,
    imageUrls: string[],
  ): Promise<string> {
    const maxRetries = 3; // Tăng lên 3 để có nhiều cơ hội với key rotation
    const models = [
      'gemini-2.5-flash',     // Stable, less quota pressure
      'gemini-2.0-flash', // Experimental backup
    ];
    let lastError: Error;

    // Proactive rotation for load balancing
    this.proactiveRotate();

    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      const currentModel = models[modelIndex];
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: currentModel,
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.7,
            },
          });

          // Giới hạn số lượng ảnh để tránh timeout
          const maxImages = 5;
          const limitedImageUrls = imageUrls?.slice(0, maxImages) || [];

          // Ghép danh sách URL ảnh
          const imagesReference =
            limitedImageUrls.length > 0
              ? limitedImageUrls.map((url, index) => `Image ${index + 1}: ${url}`).join('\n')
              : '';

          // Lấy prompt từ ContentPage
          const contentPage = await this.contentPageRepository.findOne({
            where: { id: 1 },
          });

          // Tạo default prompt
          const defaultPrompt = `Create a lesson plan for an English lesson with the following requirements: ${lessonPlan}.${imagesReference ? ` Use the following images as references:\n${imagesReference}.` : ''} Return the result without bold or italic.`;

          // Sử dụng promptLessonPlan từ DB nếu có, thay thế các biến động
          let prompt: string;
          if (contentPage?.promptLessonPlan) {
            prompt = contentPage.promptLessonPlan
              .replace(/\$\{lessonPlan\}/g, lessonPlan)
              .replace(/\$\{imagesReference\}/g, imagesReference || 'No images provided');
          } else {
            prompt = defaultPrompt;
          }

          // Thêm timeout wrapper
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error('Gemini API timeout after 60 seconds')), 60000);
          });

          const generatePromise = model.generateContent(prompt).then((result) => result.response.text());

          const response = await Promise.race([generatePromise, timeoutPromise]);

          // Success - increment usage
          this.incrementKeyUsage();
          console.log(`✅ enhanceLessonPlan successful with key #${this.currentKeyIndex + 1}, model: ${currentModel}`);
          return response;
        } catch (error) {
          lastError = error;

          // Nếu là lỗi quota (429), thử rotate sang key khác
          if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
            console.error(`❌ Quota exceeded on key #${this.currentKeyIndex + 1}`);
            this.markCurrentKeyAsFailed();
            
            if (this.apiKeys.length > 1) {
              console.log(`🔄 Rotating to next key...`);
              this.rotateApiKey();
              // Retry với key mới
              continue;
            } else {
              throw this.formatError(error);
            }
          }

          // Nếu là lỗi 503 (overloaded), thử lại sau một khoảng thời gian
          if (error.message.includes('503') || error.message.includes('overloaded')) {
            if (attempt < maxRetries - 1) {
              const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              continue;
            }
            // Nếu hết retry cho model này, thử model tiếp theo
            break;
          }

          // Nếu không phải lỗi 503, throw ngay
          throw this.formatError(error);
        }
      }
    }

    // Nếu tất cả models và retries đều fail
    throw this.formatError(lastError);
  }

  private formatError(error: any): Error {
    // Return more specific error messages
    if (error.message.includes('timeout')) {
      return new Error('Request took too long. Please try with fewer images or simpler content.');
    }
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
      return new Error('API quota exceeded. All available API keys have been exhausted. Please wait a few hours or try again tomorrow.');
    }
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      return new Error('AI service is temporarily overloaded. Please try again in a few moments.');
    }
    if (error.message.includes('network')) {
      return new Error('Network error. Please check your connection.');
    }

    return new Error(`Failed to enhance lesson plan: ${error.message || 'Unknown error'}`);
  }

  /**
   * Get current API key rotation status for monitoring
   */
  getKeyRotationStatus() {
    const status = {
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex + 1,
      keyStatuses: this.apiKeys.map((_, index) => {
        const key = this.apiKeys[index];
        return {
          keyNumber: index + 1,
          failures: this.keyFailureCounts.get(key) || 0,
          usageCount: this.keyUsageCounts.get(key) || 0,
          isActive: index === this.currentKeyIndex,
          status: (this.keyFailureCounts.get(key) || 0) >= this.MAX_FAILURES_PER_KEY 
            ? 'blocked' 
            : index === this.currentKeyIndex 
            ? 'active' 
            : 'ready',
        };
      }),
    };
    return status;
  }

  /**
   * Manually reset all key failure counts (admin function)
   */
  resetKeyFailures(): void {
    this.keyFailureCounts.clear();
    this.keyUsageCounts.clear();
    console.log('🔄 All API key failure and usage counts have been reset');
  }

  /**
   * Split long content into chunks to avoid token limits
   * Useful for very long lesson plans
   */
  private splitIntoChunks(text: string, maxChunkLength: number = 3000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentences
    
    let currentChunk = '';
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  async analyzeWithImage(question: string, imageUrl: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const hasQuestion = question && question.trim().length > 0;
    const hasImage = imageUrl && imageUrl.trim().length > 0;

    let prompt = '';
    let imageParts = [];

    if (hasImage) {
      try {
        // Tải hình ảnh từ URL
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });
        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');

        // Tạo phần hình ảnh cho Gemini API
        imageParts = [
          {
            inlineData: {
              data: base64Image,
              mimeType: response.headers['content-type'] || 'image/jpeg',
            },
          },
        ];

        prompt = hasQuestion
          ? `Suggest an answer for the following question: "${question}" using the provided image. Return the answer without bold or italic.`
          : `Suggest an answer based on the provided image. Return the answer without bold or italic.`;
      } catch (error) {
        console.error('Error downloading image:', error);
        prompt = `Error: Could not download image from ${imageUrl}.`;
      }
    } else if (hasQuestion) {
      prompt = `Suggest an answer for the following question: "${question}". Return the answer without bold or italic.`;
    } else {
      prompt = `No question or image provided.`;
    }

    // Gửi prompt và dữ liệu hình ảnh (nếu có) tới Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  }

  async createAIConversation(
    topic: string,
    level: string,
    name: string,
    imageUrl?: string,
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = `
You are a friendly English conversation partner helping ESL students practice speaking.
Start the chat with a warm, natural greeting using the student's name.
Then ask 2–3 engaging questions related to the given topic.
Questions must fit the student's English level:
- Beginner: short, simple, daily-life questions.
- Intermediate: casual and slightly complex.
- Advanced: deeper, discussion-type questions.

Avoid bold, italics, or markdown formatting.
Return only natural-sounding English dialogue.

Topic: ${topic}
Student name: ${name}
English level: ${level}
`;

    let imageParts = [];
    if (imageUrl && imageUrl.trim().length > 0) {
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');

        imageParts = [
          {
            inlineData: {
              data: base64Image,
              mimeType: response.headers['content-type'] || 'image/jpeg',
            },
          },
        ];

        prompt += `\nUse the provided image as context if it's relevant to the topic.`;
      } catch (error) {
        console.error('Error downloading image:', error);
        prompt += `\n(Note: Could not load the image from ${imageUrl}.)`;
      }
    }

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  }

  async replyToStudentAnswer(data: {
    classId: number;
    studentId: number;
    teacherId: number;
    answer: string;
    audioUrl?: string;   // 👈 add this
  }): Promise<string> {
    // ✅ use a current model
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
    // 1) find active topic
    const activeTopic = await this.chatTopicRepository.findOne({
      where: { classId: data.classId, active: true },
      order: { createdAt: 'DESC' },
    });
    if (!activeTopic) {
      throw new Error(`No active topic found for class ${data.classId}`);
    }
  
    // 2) build prompt
    const prompt = `
  You are an encouraging English teacher continuing a conversation practice with an ESL student.
  Topic: "${activeTopic.title}"
  Student's latest answer: "${data.answer}"
  
  Please reply naturally in English:
  - Stay on topic.
  - Include exactly ONE follow-up question only (use exactly one '?' in total).
  - Do not ask multiple questions.
  - Match the student's approximate English level (simple grammar if beginner).
  - Do NOT use bold, italics, or markdown.
  If an audio clip is provided, use it to infer pronunciation, intent, or extra context.
  `.trim();
  
    // 3) assemble parts (text + optional audio)
    const parts: any[] = [{ text: prompt }];
  
    if (data.audioUrl && data.audioUrl.trim().length > 0) {
      try {
        const resp = await axios.get<ArrayBuffer>(data.audioUrl, { responseType: 'arraybuffer' });
        const buf = Buffer.from(resp.data);
        const base64 = buf.toString('base64');
  
        // prefer server mime; fallback to extension
        const mimeType =
          (resp.headers['content-type'] as string) ||
          this.guessMimeFromUrl(data.audioUrl);
  
        parts.push({
          inlineData: { data: base64, mimeType },
        });
      } catch (e) {
        // don’t fail the whole request—just continue text-only
        console.error('Audio download failed:', e?.message || e);
      }
    }
  
    // 4) call Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });
    const aiReply = this.enforceSingleQuestionReply(result.response.text());
  
    // 5) save & notify
    const chat = await this.chatService.createChat({
      classId: data.classId,
      teacherId: data.teacherId,
      studentId: data.studentId,
      senderRole: 'teacher',
      message: aiReply,
    });
    this.chatGateway.notifyNewChat(data.classId, chat);
  
    return aiReply;
  }
  
}
