// src/message/message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule để dùng JwtService
import { Class } from 'src/class/class.entity';
import { ChatGateway } from './chat.gateway';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Class]), // Đăng ký các entity
    AuthModule, // Import AuthModule để có thể inject JwtService và AuthGuard
  ],
  controllers: [MessageController],
  providers: [MessageService, ChatGateway, WsAuthGuard],
})
export class MessageModule {}
