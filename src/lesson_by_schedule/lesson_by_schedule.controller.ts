import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LessonByScheduleService } from './lesson_by_schedule.service';
import {
  CreateLessonByScheduleDto,
  CreateManyLessonsDto,
  UpdateLessonByScheduleDto,
} from './lesson_by_schedule.dto';
import { LessonBySchedule } from './lesson_by_schedule.entity';

@Controller('lesson-by-schedule')
export class LessonByScheduleController {
  constructor(
    private readonly lessonByScheduleService: LessonByScheduleService,
  ) {}

  @Get()
  async findAll(): Promise<LessonBySchedule[]> {
    return await this.lessonByScheduleService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LessonBySchedule> {
    return await this.lessonByScheduleService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateLessonByScheduleDto,
  ): Promise<LessonBySchedule> {
    return await this.lessonByScheduleService.create(createDto);
  }
  @Post('/bulk-create')
  async createMany(@Body() createManyDto: CreateManyLessonsDto) {
    return this.lessonByScheduleService.createMany(createManyDto);
  }
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLessonByScheduleDto,
  ): Promise<LessonBySchedule> {
    return await this.lessonByScheduleService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.lessonByScheduleService.remove(id);
  }
}
