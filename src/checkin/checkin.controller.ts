import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  async createCheckin(
    @Body('lessonByScheduleId') lessonByScheduleId: number,
    @Body('studentId') studentId: number,
    @Body('present') present: number,
    @Body('note') note?: string,
  ) {
    return await this.checkinService.createCheckin(
      lessonByScheduleId,
      studentId,
      present,
      note,
    );
  }

  @Get('lesson/:lessonByScheduleId')
  async getCheckinsByLesson(
    @Param('lessonByScheduleId') lessonByScheduleId: number,
  ) {
    return await this.checkinService.getCheckinsByLesson(lessonByScheduleId);
  }
}
