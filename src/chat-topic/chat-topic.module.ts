import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from 'src/files/files.service';
import { ChatTopicGateway } from './chat-topic.gateway';
import { ChatTopic } from './chat-topic.entity';
import { ChatTopicService } from './chat-topic.service';
import { ChatTopicController } from './chat-topic.controller';
import { Class } from 'src/class/class.entity';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { GeminiModule } from 'src/gemini/gemini.module';
import { ChatModule } from 'src/chat/chat.module';
import { AiTtsService } from 'src/common/ai-tts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatTopic, Class, Student, Teacher]),
    forwardRef(() => GeminiModule), // ✅ prevent undefined module
    ChatModule,
  ],
  controllers: [ChatTopicController],
  providers: [ChatTopicService, FilesService, ChatTopicGateway, AiTtsService],
  exports: [TypeOrmModule, ChatTopicService, ChatTopicGateway],
})
export class ChatTopicModule {}
