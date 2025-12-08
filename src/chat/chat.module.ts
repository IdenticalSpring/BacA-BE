import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from './chat.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { Class } from 'src/class/class.entity';
import { GeminiModule } from 'src/gemini/gemini.module';
import { WsAuthGuard } from 'src/message/ws-auth.guard'; // ✅ add this import
import { ChatTopic } from 'src/chat-topic/chat-topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Student, Teacher, Class, ChatTopic]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => GeminiModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthGuard],
  exports: [ChatService, ChatGateway, JwtModule],
})
export class ChatModule {}
