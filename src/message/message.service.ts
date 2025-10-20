// src/message/message.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { Class } from 'src/class/class.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
    sender: Partial<Student> | Partial<Teacher>,
    senderType: 'student' | 'teacher',
  ): Promise<Message> {
  
    const { content, imageUrl, audioUrl, classId } = createMessageDto;

    const targetClass = await this.classRepository.findOneBy({ id: classId });
    if (!targetClass) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    const newMessage = this.messageRepository.create({
      content,
      imageUrl,
      audioUrl,
      class: targetClass,
      senderType,
    });

    if (senderType === 'student') {
      newMessage.senderStudent = sender as Student;
    } else {
      newMessage.senderTeacher = sender as Teacher;
    }

    return this.messageRepository.save(newMessage);
  }

  async getMessagesForClass(classId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { class: { id: classId } },
      relations: ['senderStudent', 'senderTeacher'], // Lấy thông tin người gửi
      order: {
        createdAt: 'ASC', // Sắp xếp tin nhắn từ cũ đến mới
      },
    });
  }

  async recallMessage(
    messageId: number,
    requestingUser: { userId: number; role: string },
  ): Promise<void> {
    // Trả về void vì tin nhắn đã bị xóa
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['senderStudent', 'senderTeacher'],
    });

    if (!message) {
      // Nếu tin nhắn không tồn tại (có thể đã bị xóa trước đó), không cần báo lỗi
      // mà chỉ đơn giản là kết thúc.
      return;
    }

    // Xác định người sở hữu tin nhắn
    let ownerId: number | null = null;
    if (message.senderType === 'student' && message.senderStudent) {
      ownerId = message.senderStudent.id;
    } else if (message.senderType === 'teacher' && message.senderTeacher) {
      ownerId = message.senderTeacher.id;
    }

    // Kiểm tra quyền: vai trò và ID phải khớp
    const isOwner =
      message.senderType === requestingUser.role &&
      ownerId === requestingUser.userId;

    if (!isOwner) {
      throw new ForbiddenException('Bạn không có quyền xóa tin nhắn này.');
    }

    // Nếu có quyền, thực hiện xóa tin nhắn khỏi DB
    await this.messageRepository.remove(message);
  }
}
