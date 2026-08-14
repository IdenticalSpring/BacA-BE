import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import { LessonByScheduleService } from './lesson_by_schedule.service';
import { LessonByScheduleController } from './lesson_by_schedule.controller';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonBySchedule,
      Class,
      Schedule,
      ClassSchedule,
    ]),
  ],
  providers: [LessonByScheduleService],
  controllers: [LessonByScheduleController],
  exports: [TypeOrmModule],
})
export class LessonByScheduleModule {}
