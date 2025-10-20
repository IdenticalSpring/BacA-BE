import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ChatTopicService } from './chat-topic.service';

@Controller('chat-topic')
export class ChatTopicController {
  constructor(private readonly chatTopicService: ChatTopicService) {}

  @Post('create')
  async createChatTopic(
    @Body('title') title: string,
    @Body('classId', ParseIntPipe) classId: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
    @Body('level') level: string,
    @Body('active') active: boolean,
    @Body('image') imageUrl?: string,
    @Body('audioUrl') audioUrl?: string,
  ) {
    const result = await this.chatTopicService.createTopic({
      classId,
      teacherId,
      title,
      level,
      imageUrl,
      audioUrl,
    });

    return {
      message: 'Chat topic created successfully',
      topic: result.topic,
      aiMessage: result.aiMessage,
    };
  }

  @Patch('deactivate/:topicId')
  async deactivateTopic(@Param('topicId') topicId: string) {
    const id = Number(topicId);
    await this.chatTopicService.deactivateTopic(id);
    return { success: true };
  }
  
  @Get('latest/:classId')
  async getActiveTopicByClassId(@Param('classId') classId: string) {
    const parsedClassId = Number(classId);
    if (isNaN(parsedClassId)) throw new BadRequestException('Invalid classId');
    const topic = await this.chatTopicService.getLatestTopicByClassId(parsedClassId);
    return { classId: parsedClassId, topic };
  }
}
