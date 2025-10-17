import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsAuthGuard } from 'src/message/ws-auth.guard';
import { CreateChatDto } from './chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * Generate unique room name for each teacher–student conversation
   */
  private getRoomName(classId: number, studentId: number): string {
    return `${classId}-${studentId}`;
  }

  /**
   * Join a private 1-to-1 chat room between teacher and student
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinPrivateChat')
  handleJoinPrivateChat(
    @MessageBody() data: { classId: number; studentId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getRoomName(data.classId, data.studentId);
    client.join(room);
    this.logger.log(`Client ${client.id} joined private room ${room}`);
    client.emit('joinedPrivateChat', { room });
  }

  /**
   * Send private message from teacher↔student
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendPrivateChat')
  async handleSendPrivateChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Save chat to database
    const chat = await this.chatService.createChat(dto);

    // Emit to corresponding private room
    const room = this.getRoomName(dto.classId, dto.studentId);
    this.server.to(room).emit('newPrivateChat', chat);

    this.logger.log(`Private chat sent to room ${room}`);
  }

  /**
   * Revoke (delete/recall) a chat message in private chat
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('revokePrivateChat')
  async handleRevokePrivateChat(
    @MessageBody() data: { chatId: number; classId: number; studentId: number },
  ) {
    const chat = await this.chatService.revokeChat({
      chatId: data.chatId,
      isRevoked: true,
    });
    const room = this.getRoomName(data.classId, data.studentId);
    this.server.to(room).emit('privateChatRevoked', chat);
    this.logger.log(`Chat ${data.chatId} revoked in room ${room}`);
  }

  /**
   * Mark messages as read in a private chat
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('markPrivateRead')
  async handlePrivateRead(
    @MessageBody()
    data: {
      classId: number;
      studentId: number;
      readerRole: 'student' | 'teacher';
    },
  ) {
    await this.chatService.markMessagesAsRead(
      data.classId,
      data.studentId,
      data.readerRole,
    );
    const room = this.getRoomName(data.classId, data.studentId);
    this.server.to(room).emit('privateMessagesRead', data);
    this.logger.log(`Messages marked as read for room ${room}`);
  }

  /**
   * ✅ Legacy compatibility — still allows GeminiService / ChatTopicService
   *    to broadcast chat messages using the old notifyNewChat() method.
   *    If student info is provided, send to private room; otherwise broadcast to class.
   */
  notifyNewChat(classId: number, chat: any) {
    try {
      const studentId = chat?.student?.id || chat?.studentId;

      if (studentId) {
        // Send to private room between teacher and student
        const room = this.getRoomName(classId, studentId);
        this.server.to(room).emit('newPrivateChat', chat);
        this.logger.log(`notifyNewChat: Sent to private room ${room}`);
      } else {
        // Fallback to entire class broadcast (group mode)
        this.server.to(String(classId)).emit('newChat', chat);
        this.logger.log(`notifyNewChat: Sent to class room ${classId}`);
      }
    } catch (error) {
      this.logger.error(`notifyNewChat error: ${error.message}`);
    }
  }
}
