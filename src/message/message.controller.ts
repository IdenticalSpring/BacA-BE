// src/message/message.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from '../auth/auth.guard'; // Sử dụng AuthGuard bạn đã có
import { Roles } from 'src/auth/roles.decorator';

@Controller('messages')
@UseGuards(AuthGuard) // Bảo vệ tất cả các route trong controller này
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('class/:classId')
  @Roles('teacher', 'student') // Chỉ giáo viên và học sinh mới được xem
  async getMessagesForClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.messageService.getMessagesForClass(classId);
  }
}
