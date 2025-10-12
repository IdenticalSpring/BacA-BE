import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsAuthGuard } from 'src/message/ws-auth.guard';
import { CreateChatDto } from './chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinChatRoom')
  handleJoinRoom(
    @MessageBody() data: { classId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = String(data.classId);
    client.join(room);
    console.log(`Client ${client.id} joined chat room ${room}`);
    client.emit('joinedChatRoom', { classId: data.classId });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendChat')
  async handleSendChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.chatService.createChat(dto);
    this.server.to(String(dto.classId)).emit('newChat', chat);
    console.log(`Broadcasted new chat in class ${dto.classId}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('revokeChat')
  async handleRevokeChat(
    @MessageBody() data: { chatId: number; isRevoked: boolean },
  ) {
    const chat = await this.chatService.revokeChat(data);
    this.server.to(String(chat.class.id)).emit('chatRevoked', chat);
    console.log(`Revoked chat ${data.chatId}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('readMessages')
  async handleMarkRead(
    @MessageBody()
    data: { classId: number; readerId: number; readerRole: 'student' | 'teacher' },
  ) {
    await this.chatService.markMessagesAsRead(
      data.classId,
      data.readerId,
      data.readerRole,
    );
    this.server.to(String(data.classId)).emit('messagesRead', data);
    console.log(`Messages marked as read for class ${data.classId}`);
  }

  notifyNewChat(classId: number, chat: any) {
    this.server.to(String(classId)).emit('newChat', chat);
  }
}
