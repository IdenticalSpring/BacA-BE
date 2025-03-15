import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { ClassScheduleModule } from '../classSchedule/classSchedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, ClassSchedule]),
    forwardRef(() => ClassScheduleModule),
  ],
  providers: [LessonService],
  controllers: [LessonController],
  exports: [TypeOrmModule],
})
export class LessonModule {}
