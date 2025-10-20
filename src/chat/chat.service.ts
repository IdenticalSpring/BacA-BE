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

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

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
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

    // 2️⃣ If the sender is a STUDENT — trigger Gemini auto-reply
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
  }): Promise<string> {
    console.log(
      '🧩 [AI DEBUG] autoReplyForActiveTopic called with data:',
      data,
    );

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    try {
      console.log('🔍 [AI DEBUG] Searching for active topic...');
      const activeTopic = await this.chatTopicRepository.findOne({
        where: { classId: data.classId, active: true },
        order: { createdAt: 'DESC' },
      });

      console.log('🧩 [AI DEBUG] Active topic result:', activeTopic);

      if (!activeTopic) {
        console.log(
          `⚠️ [AI DEBUG] No active topic found for class ${data.classId}. Skipping AI reply.`,
        );
        return '';
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
        return `${role}: ${chat.message || '[...]'}`;
      });

      const conversationContext = history.join('\n');

      const prompt = `
  You are a friendly and patient English teacher continuing a conversation practice with an ESL student.
  
  Context:
  Topic: "${activeTopic.title}"
  Conversation so far:
  ${conversationContext}
  
  The student just said:
  "${data.answer}"
  
  Your task:
  - Continue the conversation naturally and stay on topic.
  - Keep the tone encouraging and conversational.
  - Ask **one** relevant follow-up question.
  - Do not use bold, italics, or markdown symbols.
  `;

      console.log('📜 [AI DEBUG] Gemini Prompt:', prompt);

      console.log('🚀 [AI DEBUG] Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiReply = (response.text() || '').trim();

      console.log('🤖 [AI DEBUG] Raw Gemini reply:', aiReply);

      if (!aiReply) {
        console.log('⚠️ [AI DEBUG] Gemini returned empty reply.');
        return '';
      }

      console.log('💾 [AI DEBUG] Saving AI reply to database...');
      const teacherChat = await this.createChat({
        classId: data.classId,
        teacherId: data.teacherId,
        studentId: data.studentId,
        senderRole: 'teacher',
        message: aiReply,
      });

      console.log(
        `✅ [AI DEBUG] AI reply saved successfully. Message ID: ${teacherChat.id}`,
      );

      return teacherChat.message;
    } catch (error) {
      console.error('❌ [AI DEBUG] Error in AI auto-reply:', error);
      return '';
    }
  }

  
}
