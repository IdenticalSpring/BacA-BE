import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, LessonBySchedule])],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [TypeOrmModule],
})
export class ScheduleModule {}
