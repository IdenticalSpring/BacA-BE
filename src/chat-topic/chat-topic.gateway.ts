// src/chat-topic/chat-topic.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsAuthGuard } from 'src/message/ws-auth.guard';
import { ChatTopicService } from './chat-topic.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatTopicGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatTopicGateway.name);

  constructor(private readonly chatTopicService: ChatTopicService) {}

  /**
   * Student joins their class topic room.
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinClassTopic')
  handleJoinClassTopic(
    @MessageBody() data: { classId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `class-${data.classId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined topic room ${room}`);
    client.emit('joinedClassTopic', { room });
  }

  /**
   * Teacher creates a new topic for a class.
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('createTopic')
  async handleCreateTopic(
    @MessageBody()
    payload: {
      classId: number;
      teacherId: number;
      title: string;
      level: string;
      imageUrl?: string;
      audioUrl?: string;
    },
  ) {
    const result = await this.chatTopicService.createTopic(payload);
    const room = `class-${payload.classId}`;

    // broadcast to everyone in that class
    this.server.to(room).emit('newTopic', result.topic);
    this.logger.log(`New topic broadcasted to room ${room}`);
  }

  /**
   * Manually broadcast topic from service (for REST-created topic)
   */
  notifyNewTopic(classId: number, topic: any) {
    try {
      const room = `class-${classId}`;
      this.server.to(room).emit('newTopic', topic);
      this.logger.log(`Topic ${topic.id} broadcasted to ${room}`);
    } catch (err) {
      this.logger.error(`notifyNewTopic error: ${err.message}`);
    }
  }
}
