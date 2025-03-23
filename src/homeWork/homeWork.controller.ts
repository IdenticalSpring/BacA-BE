import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeWorkService } from './homeWork.service';
import {
  CreateHomeWorkDto,
  findHomeWorkByLevelAndTeacherIdDto,
  UpdateHomeWorkDto,
} from './homeWork.dto';
import { HomeWork } from './homeWork.entity';
@Controller('homeworks')
export class HomeWorkController {
  constructor(private readonly homeworkService: HomeWorkService) {}

  @Get()
  async findAll(): Promise<HomeWork[]> {
    return await this.homeworkService.findAll();
  }
  @Post('level')
  async findHomeWorkByLevelAndTeacherId(
    @Body() findHomeWorkByLevelAndTeacherId: findHomeWorkByLevelAndTeacherIdDto,
  ): Promise<HomeWork[]> {
    return await this.homeworkService.findHomeWorkByLevelAndTeacherId(
      findHomeWorkByLevelAndTeacherId,
    );
  }
  @Get('teacher/:teacherId')
  async findHomeWorkByTeacherId(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<HomeWork[]> {
    return await this.homeworkService.findHomeWorkByTeacherId(teacherId);
  }
  @Get('lesson/:lessonByScheduleId')
  async getHomeworkByLessonbySchedule(
    @Param('lessonByScheduleId', ParseIntPipe) lessonByScheduleId: number,
  ): Promise<HomeWork[]> {
    return await this.homeworkService.getHomeworkByLessonbySchedule(
      lessonByScheduleId,
    );
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<HomeWork> {
    return await this.homeworkService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('mp3File'))
  async create(
    @Body() createHomeWorkDto: CreateHomeWorkDto,
    @UploadedFile() mp3File: Express.Multer.File,
  ): Promise<HomeWork> {
    return await this.homeworkService.create(createHomeWorkDto, mp3File);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeWorkDto: UpdateHomeWorkDto,
  ): Promise<HomeWork> {
    return await this.homeworkService.update(id, updateHomeWorkDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.homeworkService.remove(id);
  }
}
