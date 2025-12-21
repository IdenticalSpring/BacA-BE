import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, SenderRole } from './chat.entity';
import { CreateChatDto, RevokeChatDto } from './chat.dto';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';
import { GeminiService } from '../gemini/gemini.service';
import { ChatTopic } from 'src/chat-topic/chat-topic.entity';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { GeminiKeyRotator } from 'src/common/gemini-key-rotator';

function inferAudioMimeFromUrl(url: string): string {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".webm")) return "audio/webm";
  if (u.endsWith(".mp3")) return "audio/mpeg";
  if (u.endsWith(".wav")) return "audio/wav";
  if (u.endsWith(".m4a")) return "audio/mp4";
  if (u.endsWith(".ogg")) return "audio/ogg";
  if (u.endsWith(".aac")) return "audio/aac";
  return "audio/webm";
}

/**
 * ĐỌC FILE LOCAL TRƯỚC, TRÁNH LỖI 404 KHI GỌI URL
 */
async function fetchAsBase64(urlOrPath: string): Promise<{ base64: string; mimeType: string }> {
  try {
    // 1. Cố gắng đọc từ thư mục uploads nội bộ trước
    const fileName = urlOrPath.split('/').pop();
    const localPath = path.join(process.cwd(), 'uploads', fileName);

    if (fs.existsSync(localPath)) {
      console.log(`📂 [fetchAsBase64] Reading local file: ${localPath}`);
      const fileBuffer = fs.readFileSync(localPath);
      const mimeType = inferAudioMimeFromUrl(fileName);
      return {
        base64: fileBuffer.toString('base64'),
        mimeType: mimeType
      };
    }

    // 2. Nếu không thấy file local, mới dùng Axios gọi URL (Fallback)
    console.log(`🌐 [fetchAsBase64] Local file not found, trying HTTP fetch: ${urlOrPath}`);
    const response = await axios.get(urlOrPath, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'] || inferAudioMimeFromUrl(urlOrPath);
    return {
      base64: Buffer.from(response.data).toString('base64'),
      mimeType
    };

  } catch (error) {
    console.error(`❌ [fetchAsBase64] Error processing audio: ${error.message}`);
    throw error;
  }
}
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private geminiRotator = new GeminiKeyRotator({ cooldownMs: 90_000 });
  private readonly AI_BOT_ID = 97777;
  private readonly TTS_API_URL = 'http://45.13.132.111:5000/tts';

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(ChatTopic)
    private chatTopicRepository: Repository<ChatTopic>,
    @Inject(forwardRef(() => GeminiService))
    private readonly geminiService: GeminiService,
  ) {}

  async createChat(dto: CreateChatDto): Promise<Chat> {
    // 1️⃣ Create the user's chat message first
    const chat = new Chat();
    chat.class = await this.classRepository.findOneBy({ id: dto.classId });
    if (dto.studentId) {
      chat.student = await this.studentRepository.findOneBy({
        id: dto.studentId,
      });
    }
    if (dto.teacherId) {
      chat.teacher = await this.teacherRepository.findOneBy({
        id: dto.teacherId,
      });
    }
    chat.senderRole = dto.senderRole;
    chat.message = dto.message;
    chat.audioUrl = dto.audioUrl;
    chat.imageUrl = dto.imageUrl;

    const savedChat = await this.chatRepository.save(chat);
    console.log(
      `💬 [ChatService] Chat saved: ${savedChat.id}, senderRole=${savedChat.senderRole}`,
    );

    // Mục đích: Đảm bảo có đầy đủ relation student, teacher để Frontend không bị lỗi filter
    const fullChat = await this.chatRepository.findOne({
      where: { id: savedChat.id },
      relations: ['student', 'teacher'],
    });

    // AI handling is now done in Gateway to avoid duplication
    // The createChat() method just saves the message

    // 3️⃣ Return the user's original message
    return fullChat;
  }

  async getChatsByClass(classId: number): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { class: { id: classId } },
      relations: ['student', 'teacher'],
      order: { createdAt: 'ASC' },
    });
  }

  async revokeChat(dto: RevokeChatDto): Promise<Chat> {
    const chat = await this.chatRepository.findOneBy({ id: dto.chatId });
    if (!chat) throw new NotFoundException('Chat not found');
    chat.isRevoked = dto.isRevoked;
    return this.chatRepository.save(chat);
  }

  async markMessagesAsRead(
    classId: number,
    readerId: number,
    readerRole: SenderRole,
  ): Promise<{ success: boolean }> {
    // Xác định vai trò của người gửi tin nhắn (ngược lại với người đọc)
    const senderRoleToUpdate = readerRole === 'teacher' ? 'student' : 'teacher';

    await this.chatRepository.update(
      {
        class: { id: classId }, // Trong lớp học này
        senderRole: senderRoleToUpdate, // Tin nhắn được gửi bởi người kia
        isRead: false, // Chỉ cập nhật những tin chưa đọc
        // Đảm bảo đúng cuộc trò chuyện 1-1
        ...(senderRoleToUpdate === 'student' && { student: { id: readerId } }),
        ...(senderRoleToUpdate === 'teacher' && { teacher: { id: readerId } }),
      },
      { isRead: true }, // Đặt isRead = true
    );

    return { success: true };
  }

  async getActiveTopicByClassId(classId: number) {
    return this.chatTopicRepository.findOne({
      where: { classId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Send Message with AI Integration (IMPROVED VERSION)
   * Step A: Save user message
   * Step B: Check isAI flag
   * Step C: Process with AI asynchronously (don't block)
   */
  async sendMessage(dto: CreateChatDto): Promise<Chat> {
    this.logger.log(`📨 [ChatService] sendMessage called with isAI=${dto.isAI}`);

    // Step A: Save user's message first
    const userChat = new Chat();
    userChat.class = await this.classRepository.findOneBy({ id: dto.classId });
    
    if (dto.studentId) {
      userChat.student = await this.studentRepository.findOneBy({ id: dto.studentId });
      userChat.senderID = dto.studentId;
    }
    if (dto.teacherId) {
      userChat.teacher = await this.teacherRepository.findOneBy({ id: dto.teacherId });
      userChat.senderID = dto.teacherId;
    }

    userChat.senderRole = dto.senderRole;
    userChat.message = dto.message;
    userChat.audioUrl = dto.audioUrl;
    userChat.imageUrl = dto.imageUrl;
    userChat.isAI = false; // User messages are not AI

    const savedUserChat = await this.chatRepository.save(userChat);
    this.logger.log(`✅ [ChatService] User message saved: ${savedUserChat.id}`);

    // Step B: Check if AI processing is requested
    if (dto.isAI && dto.message) {
      this.logger.log(`🤖 [ChatService] AI flag detected - triggering handleAIResponse`);
      
      // Fire and forget - không await để trả về ngay
      this.handleAIResponse(
        dto.classId,
        dto.message,
        dto.studentId || dto.teacherId,
        dto.senderRole,
        dto.audioUrl
      ).catch(err => {
        this.logger.error(`❌ [ChatService] AI processing failed: ${err.message}`);
      });
    }

    return savedUserChat;
  }

  /**
   * Handle AI Response Asynchronously
   * BƯỚC A: Gọi Gemini (hỗ trợ audio nếu có)
   * BƯỚC B: Gọi TTS Server
   * BƯỚC C: Lưu tin nhắn AI vào DB
   */
  public async handleAIResponse(
    classId: number,
    userContent: string,
    userSenderId: number,
    senderRole: SenderRole,
    userAudioUrl?: string,
  ): Promise<Chat> {
    try {
      this.logger.log(`🤖 [AI] Generating response for user ${userSenderId}...`);

      // BƯỚC A: Gọi Gemini với text + audio nếu có
      let aiText = '';
      
      if (userAudioUrl) {
        try {
          this.logger.log(`🎤 [AI] Processing user audio: ${userAudioUrl}`);
          const { base64, mimeType } = await fetchAsBase64(userAudioUrl);
          
          // Gọi GeminiService với audio support
          aiText = await this.geminiService.replyToStudentAnswer({
            classId,
            studentId: senderRole === 'student' ? userSenderId : null,
            teacherId: this.AI_BOT_ID,
            answer: userContent || "(Student sent an audio message)",
            audioUrl: userAudioUrl
          });
        } catch (audioError) {
          this.logger.error(`❌ [AI] Audio processing failed: ${audioError.message}`);
          // Fallback: Chỉ xử lý text
          aiText = await this.callGeminiTextOnly(userContent || "Hello");
        }
      } else {
        // Chỉ có text
        aiText = await this.callGeminiTextOnly(userContent);
      }

      this.logger.log(`✅ [AI] Gemini replied: "${aiText.substring(0, 100)}..."`);

      // BƯỚC B: Gọi TTS Server
      let botAudioUrl = null;
      try {
        const ttsResponse = await axios.post(
          this.TTS_API_URL,
          {
            text: aiText,
            voice: 'af_heart',
            voiceSpeed: '0.8',
          },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 
          }
        );

        const responseData = ttsResponse.data;
        
        // Xử lý nhiều format response từ TTS server
        if (responseData.audioData) {
          // Format cũ: trả về base64 trong audioData
          const audioBuffer = Buffer.from(responseData.audioData, 'base64');
          const fileName = `tts-ai-${randomUUID()}.mp3`;
          const uploadDir = path.join(process.cwd(), 'uploads');
          
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, audioBuffer);
          botAudioUrl = `https://api.happyclass.com.vn/uploads/${fileName}`;
        } else {
          // Format mới: trả về URL trực tiếp
          botAudioUrl = responseData.url || responseData.audio_url || (typeof responseData === 'string' ? responseData : null);
        }
        
        this.logger.log(`🔊 [AI] TTS Audio generated: ${botAudioUrl}`);
      } catch (ttsError) {
        this.logger.error(`🔇 [AI] TTS Server Error: ${ttsError.message}`);
      }

      // BƯỚC C: Lưu tin nhắn AI vào DB
      const aiMessage = await this.saveMessageToDB({
        classId,
        senderId: this.AI_BOT_ID,
        senderRole: 'teacher',
        message: aiText,
        isAI: true,
        audioUrl: botAudioUrl,
      });

      this.logger.log(`✅ [AI] AI message saved: ${aiMessage.id}`);
      return aiMessage;

    } catch (error) {
      this.logger.error(`❌ [AI] Critical Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Helper: Lưu message vào DB
   */
  private async saveMessageToDB(data: {
    classId: number;
    senderId: number;
    senderRole: SenderRole;
    message: string;
    isAI: boolean;
    audioUrl?: string;
  }): Promise<Chat> {
    const newMessage = new Chat();
    newMessage.message = data.message;
    newMessage.senderRole = data.senderRole;
    newMessage.senderID = data.senderId;
    newMessage.isAI = data.isAI;
    newMessage.audioUrl = data.audioUrl || null;
    newMessage.createdAt = new Date();

    newMessage.class = { id: data.classId } as Class;
    
    if (data.senderRole === 'student') {
      newMessage.student = { id: data.senderId } as Student;
    } else {
      newMessage.teacher = { id: data.senderId } as Teacher;
    }

    return await this.chatRepository.save(newMessage);
  }

  /**
   * Helper: Gọi Gemini Text-Only (Fallback)
   */
  private async callGeminiTextOnly(text: string): Promise<string> {
    const prompt = `You are a friendly English teacher. The student says: "${text}". Reply naturally and encouragingly. Keep it under 2 sentences.`;
    try {
      return await this.geminiService.enhanceDescription(prompt);
    } catch (e) {
      this.logger.error(`Gemini Text Error: ${e.message}`);
      return "I hear you! That's very interesting.";
    }
  }

  async autoReplyForActiveTopic(data: {
    classId: number;
    studentId: number;
    teacherId: number;
    answer: string;
    audioUrl?: string | null;
  }): Promise<Chat | null> {
    this.logger.log(`🧩 [AI] autoReplyForActiveTopic called for class ${data.classId}`);

    try {
      const activeTopic = await this.chatTopicRepository.findOne({
        where: { classId: data.classId, active: true },
        order: { createdAt: 'DESC' },
      });
      if (!activeTopic) {
        this.logger.log('ℹ️ [AI] No active topic found');
        return null;
      }

      const recentChats = await this.chatRepository.find({
        where: {
          class: { id: data.classId },
          student: { id: data.studentId },
          teacher: { id: data.teacherId },
        },
        order: { createdAt: 'DESC' },
        take: 6,
      });

      const history = recentChats.reverse().map((chat) => {
        const role = chat.senderRole === 'student' ? 'Student' : 'Teacher';
        const payload = chat.message?.trim()
          ? chat.message.trim()
          : chat.audioUrl
            ? '[AUDIO]'
            : '[...]';
        return `${role}: ${payload}`;
      });
      const conversationContext = history.join('\n');

      const instruction =
        `You are a friendly and patient English teacher continuing a conversation practice with an ESL student.\n\n` +
        `Context:\n` +
        `Topic: "${activeTopic.title}"\n` +
        `Conversation so far:\n${conversationContext}\n\n` +
        (data.audioUrl
          ? `The student just answered by audio. The attached audio is the student's answer; listen and base your reply on it.`
          : `The student just said: "${data.answer || ''}"`) +
        `\n\nYour task:\n` +
        `- Continue naturally and stay on topic. If the topic is told you to create question about something just give the question only\n` +
        `- Keep tone encouraging and conversational. keep the answer short\n` +
        `- Ask exactly one relevant follow-up question.\n` +
        `- Do not use markdown formatting.`;

      const contents: any[] = [{ role: 'user', parts: [{ text: instruction }] }];

      if (data.audioUrl) {
        try {
          const { base64, mimeType } = await fetchAsBase64(data.audioUrl);
          this.logger.log(`[AI] Attaching audio -> mime=${mimeType}, bytes=${base64.length}`);
          contents[0].parts.push({ inlineData: { data: base64, mimeType } });
        } catch (e) {
          this.logger.warn('⚠️ [AI] Failed to fetch/attach audio; falling back to text-only:', e);
        }
      }

      this.logger.log('🚀 [AI] Sending to Gemini with rotating keys…');
      const aiReply = await this.geminiRotator.generateWithRotation({
        model: 'gemini-2.5-flash',
        contents,
        temperature: 0.6,
      });

      this.logger.log(`🤖 [AI] Gemini reply: ${aiReply?.substring(0, 100)}...`);

      if (!aiReply) return null;

      // TTS Processing
      let audioData: Buffer;
      try {
        const response = await axios.post(
          'http://45.13.132.111:5000/tts',
          { text: aiReply, voice: 'af_heart', voiceSpeed: '0.8' },
          { headers: { 'Content-Type': 'application/json' } },
        );
        audioData = response.data.audioData;
      } catch (error) {
        this.logger.error('Error converting text to speech:', error?.response?.data?.message);
        audioData = null as any;
      }

      const audioBuffer = typeof audioData === 'string'
        ? Buffer.from(audioData, 'base64')
        : Buffer.from(audioData);

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `tts-${randomUUID()}.mp3`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, audioBuffer);

      const baseUrl = 'https://api.happyclass.com.vn';
      const fileUrl = `${baseUrl}/uploads/${fileName}`;

      const teacherChat = await this.createChat({
        classId: data.classId,
        teacherId: data.teacherId,
        studentId: data.studentId,
        senderRole: 'teacher',
        message: aiReply,
        audioUrl: fileUrl,
      });

      // Return full Chat object instead of just message text
      return teacherChat;
    } catch (error) {
      this.logger.error('❌ [AI] Error in AI auto-reply:', error);
      return null;
    }
  }
}

