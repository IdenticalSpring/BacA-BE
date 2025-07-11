import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, SenderRole } from './chat.entity';
import { CreateChatDto, RevokeChatDto } from './chat.dto';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async createChat(dto: CreateChatDto): Promise<Chat> {
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
    return this.chatRepository.save(chat);
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
}
