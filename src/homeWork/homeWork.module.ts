import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeWork } from './homeWork.entity';
import { HomeWorkService } from './homeWork.service';
import { HomeWorkController } from './homeWork.controller';
import { Teacher } from 'src/teacher/teacher.entity';
import { TeacherModule } from 'src/teacher/teacher.module';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeWork, Teacher, LessonBySchedule]),
    forwardRef(() => TeacherModule),
  ],
  providers: [HomeWorkService],
  controllers: [HomeWorkController],
  exports: [TypeOrmModule, HomeWorkService],
})
export class HomeWorkModule {}
