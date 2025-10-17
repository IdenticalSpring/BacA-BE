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

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Student, Teacher, Class]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // ✅ must match guard secret
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => GeminiModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthGuard], // ✅ register guard
  exports: [ChatService, ChatGateway, JwtModule], // ✅ export JwtModule for reuse
})
export class ChatModule {}
