// src/message/message.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageService } from './message.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('class/:classId')
  @Roles('teacher', 'student')
  async getMessagesForClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.messageService.getMessagesForClass(classId);
  }

  // ✅ POST endpoint to send message (text / image / audio)
  @Post('class/:classId')
  @Roles('teacher', 'student')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/messages',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, unique);
        },
      }),
    }),
  )
  async sendMessage(
    @Param('classId', ParseIntPipe) classId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMessageDto,
    @Request() req: any,
  ) {
    const user = req.user;
    const sender = { id: user.userId };
    const senderType = user.role;

    // handle file uploads
    let imageUrl = body.imageUrl;
    let audioUrl = body.audioUrl;
    if (file) {
      const mime = file.mimetype;
      if (mime.startsWith('image/')) imageUrl = `/uploads/messages/${file.filename}`;
      else if (mime.startsWith('audio/')) audioUrl = `/uploads/messages/${file.filename}`;
      else throw new BadRequestException('File must be image or audio');
    }

    return this.messageService.createMessage(
      { classId, content: body.content, imageUrl, audioUrl },
      senderType === 'student'
        ? ({ id: user.userId } as Partial<Student>)
        : ({ id: user.userId } as Partial<Teacher>),
      senderType,
    );
  }
}
