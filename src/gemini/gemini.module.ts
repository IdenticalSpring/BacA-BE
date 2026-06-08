import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ContentPage } from 'src/contentpage/contentpage.entity';
import { ChatTopicModule } from 'src/chat-topic/chat-topic.module';
import { ChatModule } from 'src/chat/chat.module';
import { DeepSeekService } from 'src/common/deepseek.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentPage]),
    forwardRef(() => ChatTopicModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [GeminiController],
  providers: [GeminiService, DeepSeekService],
  exports: [GeminiService, DeepSeekService],
})
export class GeminiModule {}
