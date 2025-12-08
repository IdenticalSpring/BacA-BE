import { Controller, Post, Body, Get, Patch, Param, Inject, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './chat.dto';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  async createChat(@Body() dto: CreateChatDto) {
    // Save user message
    const userChat = await this.chatService.createChat(dto);

    // Check if AI should process this message
    if (dto.senderRole === 'student') {
      const activeTopic = await this.chatService.getActiveTopicByClassId(dto.classId);
      
      if (activeTopic) {
        // Trigger AI response asynchronously (don't block response)
        this.chatService.autoReplyForActiveTopic({
          classId: dto.classId,
          studentId: dto.studentId,
          teacherId: dto.teacherId,
          answer: dto.message || '',
          audioUrl: dto.audioUrl || null,
        }).then((aiChat) => {
          if (aiChat) {
            // Notify via WebSocket
            this.chatGateway.notifyNewChat(dto.classId, aiChat);
            console.log(`✅ [REST API] AI reply sent via WebSocket: ${aiChat.id}`);
          }
        }).catch(err => {
          console.error('❌ [REST API] AI processing failed:', err);
        });
      }
    }

    return userChat;
  }

  @Get(':classId')
  getChatsByClass(@Param('classId') classId: number) {
    return this.chatService.getChatsByClass(Number(classId));
  }

  @Patch('revoke/:chatId')
  revokeChat(
    @Param('chatId') chatId: number,
    @Body('isRevoked') isRevoked: boolean,
  ) {
    return this.chatService.revokeChat({ chatId: Number(chatId), isRevoked });
  }

  @Post('read-messages')
  markMessagesAsRead(
    @Body()
    body: {
      classId: number;
      readerId: number;
      readerRole: 'student' | 'teacher';
    },
  ) {
    return this.chatService.markMessagesAsRead(
      body.classId,
      body.readerId,
      body.readerRole,
    );
  }
}
