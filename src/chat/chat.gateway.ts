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

  /** Generate unique room name for each teacher–student chat */
  private getRoomName(classId: number, studentId: number): string {
    return `${classId}-${studentId}`;
  }

  /** Join a private 1–1 chat room */
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

  /** Handle sending private messages with AI support */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendPrivateChat')
  async handleSendPrivateChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('💬 [ChatGateway] Received sendPrivateChat event');
    console.log('🧾 DTO:', { ...dto, message: dto.message?.substring(0, 50) });

    try {
      const room = this.getRoomName(dto.classId, dto.studentId);
      
      // 🔥 FIX: Auto-join client to private room to ensure they receive AI responses
      if (!client.rooms.has(room)) {
        client.join(room);
        this.logger.log(`🔧 [AUTO-JOIN] Client ${client.id} auto-joined room ${room}`);
      }

      // Use new sendMessage method which handles AI processing
      const chat = await this.chatService.sendMessage(dto);

      // Emit the message (could be user or AI response)
      this.server.to(room).emit('newPrivateChat', chat);
      this.logger.log(`📩 Message sent to room ${room} (isAI: ${chat.isAI})`);

      // Legacy AI check (kept for backward compatibility)
      if (dto.senderRole === 'student' && !dto.isAI) {
        this.logger.log(
          `👩‍🎓 [CHAT DEBUG] Student message detected. Checking for active topic in class ${dto.classId}...`,
        );

        const activeTopic = await this.chatService.getActiveTopicByClassId(
          dto.classId,
        );
        console.log('🧩 [CHAT DEBUG] Active topic found:', activeTopic);

        if (activeTopic && activeTopic.active) {
          this.logger.log(
            `🤖 [CHAT DEBUG] Active topic "${activeTopic.title}" found — triggering Gemini auto-reply...`,
          );

          // Call AI and get the full Chat object
          const aiChat = await this.chatService.autoReplyForActiveTopic({
            classId: dto.classId,
            studentId: dto.studentId,
            teacherId: dto.teacherId,
            answer: dto.message || '',
            audioUrl: dto.audioUrl || null,
          });

          if (aiChat) {
            this.logger.log(
              `✅ [CHAT DEBUG] AI reply generated successfully: ${aiChat.message?.substring(
                0,
                100,
              )}...`,
            );

            // Emit AI message
            console.log('🤖 [CHAT DEBUG] Emitting AI reply to room:', room);
            this.server.to(room).emit('newPrivateChat', aiChat);
            this.logger.log(`📤 AI reply emitted to ${room}`);
          } else {
            this.logger.warn(
              `⚠️ [CHAT DEBUG] AI returned an empty reply for topic "${activeTopic.title}".`,
            );
          }
        } else {
          this.logger.log(
            `ℹ️ [CHAT DEBUG] No active topic found for class ${dto.classId}. Skipping AI reply.`,
          );
        }
      } else {
        this.logger.log(
          `👨‍🏫 [CHAT DEBUG] Sender is teacher — normal message flow only.`,
        );
      }
    } catch (err) {
      this.logger.error(
        `❌ [CHAT DEBUG] Error in handleSendPrivateChat: ${err.message}`,
        err.stack,
      );
    }
  }
  /** Revoke chat message */
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
    this.logger.log(`Chat ${data.chatId} revoked in ${room}`);
  }

  /** Mark messages as read */
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
    this.logger.log(`Messages marked as read in room ${room}`);
  }

  /** Compatibility method for AI/system messages */
  notifyNewChat(classId: number, chat: any) {
    try {
      const studentId = chat?.student?.id || chat?.studentId;
      if (studentId) {
        const room = this.getRoomName(classId, studentId);
        this.server.to(room).emit('newPrivateChat', chat);
        this.logger.log(`notifyNewChat: Sent to ${room}`);
      } else {
        this.server.to(String(classId)).emit('newChat', chat);
        this.logger.log(`notifyNewChat: Sent to class ${classId}`);
      }
    } catch (error) {
      this.logger.error(`notifyNewChat error: ${error.message}`);
    }
  }
}
