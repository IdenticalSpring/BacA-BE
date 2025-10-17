import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ContentPage } from 'src/contentpage/contentpage.entity';
import { ChatTopicModule } from 'src/chat-topic/chat-topic.module';
import { ChatModule } from 'src/chat/chat.module'; // ✅ import ChatModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentPage]),
    forwardRef(() => ChatTopicModule),
    ChatModule, // ✅ now ChatService and ChatGateway are visible
  ],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
