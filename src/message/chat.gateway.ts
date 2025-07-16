// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { UseGuards } from '@nestjs/common';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { WsAuthGuard } from './ws-auth.guard';

// Cho phép kết nối từ mọi nguồn, cần chỉnh lại cho production
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { classId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joining room for class ${data.classId}`);
    client.join(data.classId); // Cho client tham gia vào phòng chat của lớp
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user as {
      userId: number;
      role: 'student' | 'teacher';
    };

    // Tạo tin nhắn trong DB
    const message = await this.messageService.createMessage(
      createMessageDto,
      { id: user.userId } as Student | Teacher, // Pass a partial entity
      user.role,
    );

    // Lấy lại tin nhắn với đầy đủ thông tin người gửi để gửi cho client
    const fullMessage = await this.messageService['messageRepository'].findOne({
      where: { id: message.id },
      relations: ['senderStudent', 'senderTeacher'],
    });

    // Phát tin nhắn tới tất cả mọi người trong phòng chat của lớp
    this.server
      .to(String(createMessageDto.classId))
      .emit('newMessage', fullMessage);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('recallMessage')
  async handleRecallMessage(
    @MessageBody() data: { messageId: number; classId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Lấy thông tin user từ socket đã được guard xác thực
    const user = client.handshake.auth.user as { userId: number; role: string };

    // Gọi service để xóa tin nhắn trong DB
    await this.messageService.recallMessage(data.messageId, user);

    // Thông báo cho mọi người trong phòng rằng tin nhắn đã bị xóa
    // Payload vẫn chứa messageId để client biết phải xóa tin nhắn nào trên UI
    this.server
      .to(String(data.classId))
      .emit('messageRecalled', { messageId: data.messageId });
  }
}
