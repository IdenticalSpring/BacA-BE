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
  BadRequestException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';
import { Lesson } from './lesson.entity';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  async findAll(): Promise<Lesson[]> {
    return await this.lessonService.findAll();
  }
  @Get('level/:level')
  async findLessonByLevel(@Param('level') level: string): Promise<Lesson[]> {
    return await this.lessonService.findLessonByLevel(level);
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Lesson> {
    return await this.lessonService.findOne(id);
  }

  @Post()
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return await this.lessonService.create(createLessonDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return await this.lessonService.update(id, updateLessonDto);
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
