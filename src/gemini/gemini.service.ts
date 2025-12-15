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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
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
  async enhanceDescription(description: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Lấy prompt từ ContentPage (giả sử id = 1, bạn có thể điều chỉnh logic)
    const contentPage = await this.contentPageRepository.findOne({
      where: { id: 1 },
    });
    const defaultPrompt = `create lesson content in detail for this english lesson, its topic and requirements as follow:${description}. Return result without bold or italic`;
    const prompt = contentPage?.promptDescription || defaultPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async enhanceLessonPlan(
    lessonPlan: string,
    imageUrls: string[],
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Ghép danh sách URL ảnh
      const imagesReference = imageUrls && imageUrls.length > 0
        ? imageUrls.map((url, index) => `Image ${index + 1}: ${url}`).join('\n')
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ [Gemini] Error enhancing lesson plan:', error.message);
      throw new Error(`Failed to enhance lesson plan: ${error.message || 'Unknown error'}`);
    }
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
  - Ask one follow-up question to keep the conversation going.
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
    const aiReply = result.response.text();
  
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
