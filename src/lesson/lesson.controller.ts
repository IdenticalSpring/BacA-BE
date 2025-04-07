import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import {
  CreateLessonDto,
  findLessonByLevelAndTeacherIdDto,
  UpdateLessonDto,
} from './lesson.dto';
import { Lesson } from './lesson.entity';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  async findAll(): Promise<Lesson[]> {
    return await this.lessonService.findAll();
  }
  @Post('level')
  async findLessonByLevelAndTeacherId(
    @Body() findLessonByLevelAndTeacherId: findLessonByLevelAndTeacherIdDto,
  ): Promise<Lesson[]> {
    return await this.lessonService.findLessonByLevelAndTeacherId(
      findLessonByLevelAndTeacherId,
    );
  }
  @Get('teacher/:teacherId')
  async findLessonByTeacherId(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<Lesson[]> {
    return await this.lessonService.findLessonByTeacherId(teacherId);
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Lesson> {
    return await this.lessonService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('mp3File'))
  async create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() mp3File: Express.Multer.File,
  ): Promise<Lesson> {
    return await this.lessonService.create(createLessonDto, mp3File);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('mp3File'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() mp3File: Express.Multer.File,
  ): Promise<Lesson> {
    return await this.lessonService.update(id, updateLessonDto, mp3File);
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.lessonService.remove(id);
  }
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  // async uploadToYoutube(
  //   @UploadedFile() file: any,
  //   @Body('title') title: string,
  //   @Body('description') description: string,
  //   @Body('status') status: boolean,
  // ) {
  //   try {
  //     if (!file) {
  //       throw new BadRequestException('File không được để trống!');
  //     }

  //     console.log('File nhận được:', file);
  //     console.log('Title:', title);
  //     console.log('Description:', description);
  //     console.log('Status:', status);

  //     const uploadedVideo = await this.lessonService.uploadVideo(
  //       file,
  //       file.originalname,
  //       file.originalname,
  //       status == status,
  //     );

  //     return { message: 'Upload thành công', videoId: uploadedVideo.id };
  //   } catch (error) {
  //     console.error('Lỗi upload lên YouTube:', error);
  //     throw new BadRequestException(`YouTube upload failed: ${error.message}`);
  //   }
  // }
}
