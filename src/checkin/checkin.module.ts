import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { Checkin } from './checkin.entity';
import { Student } from 'src/student/student.entity';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Student, LessonBySchedule])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
