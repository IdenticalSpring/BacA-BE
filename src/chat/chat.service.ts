import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, SenderRole } from './chat.entity';
import { CreateChatDto, RevokeChatDto } from './chat.dto';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatTopic } from 'src/chat-topic/chat-topic.entity';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';import { GeminiKeyRotator } from 'src/common/gemini-key-rotator';
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

async function fetchAsBase64(url: string): Promise<{ base64: string; size: number }> {
  const res = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer" });
  // @ts-ignore
  const buf: Buffer = Buffer.from(res.data);
  return { base64: buf.toString("base64"), size: buf.byteLength };
}
@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private geminiRotator = new GeminiKeyRotator({ cooldownMs: 90_000 });

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
  ) {
  }

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

    if (dto.senderRole === 'student') {
      try {
        console.log('🧠 [AI] Checking for active topic for class', dto.classId);
        const activeTopic = await this.getActiveTopicByClassId(dto.classId);

        if (activeTopic) {
          console.log(`🧩 [AI] Active topic found: "${activeTopic.title}"`);

          const aiMessage = await this.autoReplyForActiveTopic({
            classId: dto.classId,
            studentId: dto.studentId,
            teacherId: dto.teacherId,
            answer: dto.message || '',
            audioUrl: dto.audioUrl || null,
          });

          if (aiMessage) {
            console.log(
              `✅ [AI] Gemini reply generated and saved for chat: ${savedChat.id}`,
            );
          } else {
            console.warn('⚠️ [AI] Gemini returned an empty message');
          }
        } else {
          console.log(
            'ℹ️ [AI] No active topic found — skipping AI auto-reply.',
          );
        }
      } catch (error) {
        console.error('❌ [AI] Auto-reply failed:', error);
      }
    }

    // 3️⃣ Return the user's original message
    return savedChat;
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

  async autoReplyForActiveTopic(data: {
    classId: number;
    studentId: number;
    teacherId: number;
    answer: string;
    audioUrl?: string | null;
  }): Promise<string> {
    console.log('🧩 [AI DEBUG] autoReplyForActiveTopic called with data:', data);

    try {
      // --- unchanged: fetch activeTopic, recent chats, build history/instruction/contents ---
      const activeTopic = await this.chatTopicRepository.findOne({
        where: { classId: data.classId, active: true },
        order: { createdAt: 'DESC' },
      });
      if (!activeTopic) return '';

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
          const mimeType = inferAudioMimeFromUrl(data.audioUrl);
          const { base64, size } = await fetchAsBase64(data.audioUrl);
          console.log(`[AI] Attaching audio -> mime=${mimeType}, bytes=${size}`);
          contents[0].parts.push({ inlineData: { data: base64, mimeType } });
        } catch (e) {
          console.warn('⚠️ [AI] Failed to fetch/attach audio; falling back to text-only:', e);
        }
      }

      console.log('🚀 [AI] Sending to Gemini with rotating keys…');
      const aiReply = await this.geminiRotator.generateWithRotation({
        model: 'gemini-2.5-flash',
        contents,
        // Optional: tune temperature/attempts
        temperature: 0.6,
        // maxAttempts defaults to keys.length * 2
      });

      console.log('🤖 [AI DEBUG] Raw Gemini reply:', aiReply);

      if (!aiReply) return '';

      // --- your existing TTS + file save code (unchanged) ---
      let audioData: Buffer;
      try {
        const response = await axios.post(
          'http://45.13.132.111:5000/tts',
          { text: aiReply, voice: 'af_heart', voiceSpeed: '0.8' },
          { headers: { 'Content-Type': 'application/json' } },
        );
        audioData = response.data.audioData;
      } catch (error) {
        console.error('Error converting text to speech:', error?.response?.data?.message);
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

      return teacherChat.message;
    } catch (error) {
      console.error('❌ [AI DEBUG] Error in AI auto-reply:', error);
      return '';
    }
  }
}

