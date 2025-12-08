import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ContentPage } from 'src/contentpage/contentpage.entity';
import { ChatTopicModule } from 'src/chat-topic/chat-topic.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentPage]),
    forwardRef(() => ChatTopicModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
