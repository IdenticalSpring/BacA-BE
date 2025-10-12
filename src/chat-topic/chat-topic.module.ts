import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesService } from 'src/files/files.service';
import { ChatTopicGateway } from './chat-topic.gateway';
import { ChatTopic } from './chat-topic.entity';
import { ChatTopicService } from './chat-topic.service';
import { ChatTopicController } from './chat-topic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTopic])],
  controllers: [ChatTopicController],
  providers: [ChatTopicService, FilesService, ChatTopicGateway],
})
export class ChatTopicModule {}
