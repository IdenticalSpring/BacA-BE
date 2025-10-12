import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChatTopicService } from './chat-topic.service';
import { FilesService } from 'src/files/files.service';

@Controller('chat-topic')
export class ChatTopicController {
  constructor(
    private readonly chatTopicService: ChatTopicService,
    private readonly filesService: FilesService, 
  ) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async createChatTopic(
    @Body('topic') topic: string, 
    @Body('classId', ParseIntPipe) classId: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
    @Body('level') level: string,
    @Body('active') active: boolean,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    let imageUrl: string | undefined;
    let audioUrl: string | undefined;

    if (files?.image?.[0]) {
      const uploadedImage = await this.filesService.saveFile(files.image[0]);
      imageUrl = uploadedImage.url;
    }

    if (files?.audio?.[0]) {
      const uploadedAudio = await this.filesService.saveFile(files.audio[0]);
      audioUrl = uploadedAudio.url;
    }

    const result = await this.chatTopicService.createTopic({
      classId,
      teacherId,
      topic,
      level,
      imageUrl,
    });

    return {
      message: 'Chat topic created successfully',
      topic: result.topic,
      aiMessage: result.aiMessage,
      imageUrl,
      audioUrl,
    };
  }

  @Get('latest/:classId')
  async getLatestTopicByClassId(
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    const topic = await this.chatTopicService.getLatestTopicByClassId(classId);
    return { classId, topic };
  }
}
