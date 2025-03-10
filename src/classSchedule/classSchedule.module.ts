import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSchedule } from './classSchedule.entity';
import { ClassScheduleService } from './classSchedule.service';
import { ClassScheduleController } from './classSchedule.controller';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Lesson } from '../lesson/lesson.entity';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSchedule, Class, Schedule, Lesson])],
  providers: [ClassScheduleService],
  controllers: [ClassScheduleController],
  exports: [TypeOrmModule],
})
export class ClassScheduleModule {}
