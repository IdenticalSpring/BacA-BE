import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

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
}
