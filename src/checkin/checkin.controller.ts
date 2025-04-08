import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { Checkin } from './checkin.entity';
import { UpdateCheckinDto } from './checkin.dto';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get()
  async getAllCheckins(): Promise<Checkin[]> {
    return this.checkinService.getAllCheckins();
  }

  @Get('date/:date')
  async getCheckinsByDate(@Param('date') date: string): Promise<Checkin[]> {
    return this.checkinService.getCheckinsByDate(date);
  }

  @Put('date/:date')
  async updateCheckinsByDate(
    @Param('date') date: string,
    @Body() updateData: UpdateCheckinDto,
  ) {
    return this.checkinService.updateCheckinsByDate(date, updateData);
  }

  @Post()
  async createCheckins(
    @Body()
    body: {
      lessonByScheduleId: number;
      attendanceData: { studentId: number; present: number; note?: string }[];
    },
  ) {
    const { lessonByScheduleId, attendanceData } = body;
    return await this.checkinService.createCheckins(
      lessonByScheduleId,
      attendanceData,
    );
  }

  @Get('lesson/:lessonByScheduleId')
  async getCheckinsByLesson(
    @Param('lessonByScheduleId') lessonByScheduleId: number,
  ) {
    return await this.checkinService.getCheckinsByLesson(lessonByScheduleId);
  }

  @Get('student/:studentId')
  async getAllCheckinOfStudent(
    @Param('studentId') studentId: number,
  ): Promise<Checkin[]> {
    return this.checkinService.getAllCheckinOfStudent(studentId);
  }

  @Get('lesson-by-schedule/:lessonByScheduleId')
  async getAllCheckinOfLessonBySchedule(
    @Param('lessonByScheduleId') lessonByScheduleId: number,
  ): Promise<Checkin[]> {
    return this.checkinService.getAllCheckinOfLessonBySchedule(
      lessonByScheduleId,
    );
  }

  @Put('student/:studentId')
  async updateCheckinByStudentId(
    @Param('studentId') studentId: number,
    @Body() updateData: UpdateCheckinDto,
  ) {
    return this.checkinService.updateCheckinByStudentId(studentId, updateData);
  }

  @Put(':id')
  async updateCheckin(
    @Param('id') id: number,
    @Body() updateData: UpdateCheckinDto,
  ) {
    return this.checkinService.updateCheckin(id, updateData);
  }

  @Delete(':id')
  async deleteCheckin(@Param('id') id: number) {
    return this.checkinService.deleteCheckin(id);
  }
}
