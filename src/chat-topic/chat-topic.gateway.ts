import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/message/ws-auth.guard';
import { ChatTopicService } from './chat-topic.service';
import { ChatTopic } from './chat-topic.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatTopicGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatTopicService: ChatTopicService) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinTopicRoom')
  handleJoinTopicRoom(
    @MessageBody() data: { classId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = String(data.classId);
    client.join(room);
    console.log(`Client ${client.id} joined topic room ${room}`);
    client.emit('joinedTopicRoom', { classId: data.classId });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('broadcastTopic')
  async handleBroadcastTopic(
    @MessageBody() data: { classId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const latestTopic = await this.chatTopicService.getLatestTopicByClassId(
      data.classId,
    );
    if (latestTopic) {
      this.server.to(String(data.classId)).emit('newTopic', latestTopic);
      console.log(`Broadcasted topic for class ${data.classId}`);
    }
  }

  notifyTopicChange(classId: number, topic: ChatTopic) {
    this.server.to(String(classId)).emit('newTopic', topic);
    console.log(`Auto-notified new topic for class ${classId}`);
  }
}
