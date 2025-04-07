import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { Checkin } from './checkin.entity';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get()
  async getAllCheckins(): Promise<Checkin[]> {
    return this.checkinService.getAllCheckins();
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
}
