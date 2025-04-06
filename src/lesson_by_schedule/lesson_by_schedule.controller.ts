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
  UpdateHomeWorkOfLessonBySchedule,
  UpdateLessonByScheduleDto,
  UpdateLessonOfLessonBySchedule,
} from './lesson_by_schedule.dto';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Controller('lesson-by-schedule')
export class LessonByScheduleController {
  constructor(
    private readonly lessonByScheduleService: LessonByScheduleService,
  ) {}

  @Get()
  async findAll(): Promise<LessonBySchedule[]> {
    return await this.lessonByScheduleService.findAll();
  }
  @Get('class/:classID')
  async findAllLessonByScheduleOfClass(
    @Param('classID', ParseIntPipe) classID: number,
  ): Promise<LessonBySchedule[]> {
    return await this.lessonByScheduleService.findAllLessonByScheduleOfClass(
      classID,
    );
  }
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LessonBySchedule> {
    return await this.lessonByScheduleService.findOne(id);
  }
  @Get('schedules_by_class/:id')
  async findSchedulesByClass(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Schedule[]> {
    return await this.lessonByScheduleService.getSchedulesByClass(id);
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
  @Post('/updateLesson/:id')
  async updateLessonOfLessonBySchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLessonOfLessonBySchedule,
  ) {
    return this.lessonByScheduleService.updateLessonForLessonBySchedule(
      id,
      updateDto,
    );
  }
  @Post('/updateHomework/:id')
  async updateHomeWorkOfLessonBySchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHomeWorkOfLessonBySchedule,
  ) {
    return this.lessonByScheduleService.updateHomeWorkForLessonBySchedule(
      id,
      updateDto,
    );
  }
  @Post('/updateIsHomeWorkSent/:id')
  async updateIsHomeWorkSent(
    @Param('id', ParseIntPipe) id: number,
    @Body('isHomeWorkSent') isHomeWorkSent: boolean,
  ) {
    return this.lessonByScheduleService.updateSendingHomeWorkStatus(
      id,
      isHomeWorkSent,
    );
  }
  @Post('/updateIsLessonSent/:id')
  async updateIsLessonSent(
    @Param('id', ParseIntPipe) id: number,
    @Body('isLessonSent') isLessonSent: boolean,
  ) {
    return this.lessonByScheduleService.updateSendingLessonStatus(
      id,
      isLessonSent,
    );
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
