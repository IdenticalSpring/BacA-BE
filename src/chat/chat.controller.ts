import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(@Body() dto: CreateChatDto) {
    return this.chatService.createChat(dto);
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
}
