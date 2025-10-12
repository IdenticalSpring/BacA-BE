import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ChatTopicGateway } from './chat-topic.gateway';
import { ChatTopic } from './chat-topic.entity';
import { Class } from 'src/class/class.entity';
import { Student } from 'src/student/student.entity';
import { GeminiService } from 'src/gemini/gemini.service';
import { ChatService } from 'src/chat/chat.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Teacher } from 'src/teacher/teacher.entity'; 

@Injectable()
export class ChatTopicService {
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
    topic: string;
    level: string;
    imageUrl?: string;
  }) {
    // 1️⃣ Load related entities
    const classEntity = await this.classRepository.findOne({
      where: { id: data.classId },
    });
    if (!classEntity) throw new Error(`Class ${data.classId} not found`);
  
    const teacherEntity = await this.teacherRepository.findOne({
      where: { id: data.teacherId },
    });
    if (!teacherEntity) throw new Error(`Teacher ${data.teacherId} not found`);
  
    const topic = this.chatTopicRepository.create({
      class: classEntity,
      teacher: teacherEntity,
      topic: data.topic,
      imageUrl: data.imageUrl,
    } as DeepPartial<ChatTopic>);
  
    await this.chatTopicRepository.save(topic);
  
    const aiText = await this.geminiService.createAIConversation(
      data.topic,
      data.level,
      'students',
      data.imageUrl,
    );
  
    const classInfo = await this.classRepository.findOne({
      where: { id: data.classId },
      relations: ['students'],
    });
    if (!classInfo) throw new Error('Class not found when retrieving students');
  
    for (const student of classInfo.students) {
      const chat = await this.chatService.createChat({
        classId: data.classId,
        teacherId: data.teacherId,
        studentId: student.id,
        senderRole: 'teacher',
        message: aiText,
      });
  
      this.chatGateway.notifyNewChat(data.classId, chat);
    }
  
    return { topic, aiMessage: aiText };
  }
  

  async getLatestTopicByClassId(classId: number): Promise<ChatTopic | null> {
    return this.chatTopicRepository.findOne({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
  }
}
