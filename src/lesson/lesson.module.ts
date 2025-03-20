import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { ClassScheduleModule } from '../classSchedule/classSchedule.module';
import { Teacher } from 'src/teacher/teacher.entity';
import { TeacherModule } from 'src/teacher/teacher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, ClassSchedule, Teacher]),
    forwardRef(() => ClassScheduleModule),
    forwardRef(() => TeacherModule),
  ],
  providers: [LessonService],
  controllers: [LessonController],
  exports: [TypeOrmModule, LessonService],
})
export class LessonModule {}
