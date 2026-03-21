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
import { AiTtsService } from 'src/common/ai-tts.service';

@Injectable()
export class ChatTopicService {
  private readonly logger = new Logger(ChatTopicService.name);

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
    private readonly aiTtsService: AiTtsService,
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

      aiAudioUrl = await this.aiTtsService.synthesizeToAudioUrl(aiText, {
        outputFormat: 'mp3',
      });

      if (!aiAudioUrl) {
        this.logger.warn('🔇 [TTS] No audio URL returned from provider. Continue with text-only message.');
      }

      this.logger.log(`✅ [TTS] Audio generated for first message: ${aiAudioUrl}`);
    } catch (ttsError) {
      this.logger.error(`🔇 [TTS] TTS provider error for first message: ${ttsError.message}`);
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
