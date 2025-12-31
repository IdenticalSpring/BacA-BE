import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ChatTopic } from './chat-topic.entity';
import { Class } from 'src/class/class.entity';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { GeminiService } from 'src/gemini/gemini.service';
import { ChatService } from 'src/chat/chat.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatTopicService {
  private readonly logger = new Logger(ChatTopicService.name);
  private readonly TTS_API_URL = 'http://45.13.132.111:5000/tts';

  constructor(
    @InjectRepository(ChatTopic)
    private chatTopicRepository: Repository<ChatTopic>,

    @InjectRepository(Class)
    private classRepository: Repository<Class>,

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,

    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,

    private readonly geminiService: GeminiService,
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createTopic(data: {
    classId: number;
    teacherId: number;
    title: string;
    level: string;
    imageUrl?: string;
    audioUrl?: string;
  }) {
    // 1️⃣ Validate class and teacher
    const classEntity = await this.classRepository.findOne({
      where: { id: data.classId },
    });
    if (!classEntity) throw new Error(`Class ${data.classId} not found`);

    const teacherEntity = await this.teacherRepository.findOne({
      where: { id: data.teacherId },
    });
    if (!teacherEntity) throw new Error(`Teacher ${data.teacherId} not found`);

    // 2️⃣ Deactivate all previous topics for this class
    await this.chatTopicRepository.update(
      { classId: data.classId, active: true },
      { active: false },
    );

    // 3️⃣ Create new active topic
    const newTopic = this.chatTopicRepository.create({
      classId: data.classId,
      title: data.title,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      active: true, // new one is active
    } as DeepPartial<ChatTopic>);

    await this.chatTopicRepository.save(newTopic);

    // 4️⃣ Generate AI message
    const aiText = await this.geminiService.createAIConversation(
      data.title,
      data.level,
      'students',
      data.imageUrl,
    );

    // 4.5️⃣ Generate TTS audio for the AI message
    let aiAudioUrl: string | null = null;
    try {
      this.logger.log(`🔊 [TTS] Generating audio for AI first message (${aiText.length} chars)...`);
      
      // Tính timeout dựa trên độ dài text (tối thiểu 30s, tối đa 120s)
      const estimatedTimeout = Math.min(120000, Math.max(30000, aiText.length * 100));
      this.logger.log(`🔊 [TTS] Using timeout: ${estimatedTimeout}ms`);
      
      const ttsResponse = await axios.post(
        this.TTS_API_URL,
        {
          text: aiText,
          voice: 'af_heart',
          voiceSpeed: '0.8',
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: estimatedTimeout
        }
      );

      const responseData = ttsResponse.data;
      
      // Handle different TTS response formats
      if (responseData.audioData) {
        // Save audio to local storage
        const audioBuffer = Buffer.from(responseData.audioData, 'base64');
        const fileName = `tts-topic-${randomUUID()}.wav`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, audioBuffer);
        
        // Use dynamic base URL from environment or default to production
        const baseUrl = process.env.API_BASE_URL || 'https://api.happyclass.com.vn';
        aiAudioUrl = `${baseUrl}/uploads/${fileName}`;
        this.logger.log(`✅ [TTS] Audio saved locally: ${aiAudioUrl}`);
      } else {
        // New format: direct URL
        aiAudioUrl = responseData.url || responseData.audio_url || (typeof responseData === 'string' ? responseData : null);
      }
      
      this.logger.log(`✅ [TTS] Audio generated for first message: ${aiAudioUrl}`);
    } catch (ttsError) {
      this.logger.error(`🔇 [TTS] TTS Server Error for first message: ${ttsError.message}`);
      // Continue without audio - message will still be sent
    }

    // 5️⃣ Send AI message to all students in the class
    const classInfo = await this.classRepository.findOne({
      where: { id: data.classId },
      relations: ['students'],
    });

    if (classInfo?.students?.length) {
      for (const student of classInfo.students) {
        const chat = await this.chatService.createChat({
          classId: data.classId,
          teacherId: data.teacherId,
          studentId: student.id,
          senderRole: 'teacher',
          message: aiText,
          audioUrl: aiAudioUrl, // ✅ Include audio URL for first AI message
        });

        this.chatGateway.notifyNewChat(data.classId, chat);
      }
    }

    return { topic: newTopic, aiMessage: aiText, aiAudioUrl };
  }

  async getLatestTopicByClassId(classId: number): Promise<ChatTopic | null> {
    return this.chatTopicRepository.findOne({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
  }
  async deactivateTopic(topicId: number) {
    await this.chatTopicRepository.update({ id: topicId }, { active: false });
  }
  
}
