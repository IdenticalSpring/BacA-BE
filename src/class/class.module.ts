import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { Teacher } from 'src/teacher/teacher.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';
import { Student } from 'src/student/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Teacher, LessonBySchedule, Student]),
    AuthModule,
  ],
  providers: [ClassService],
  controllers: [ClassController],
  exports: [TypeOrmModule],
})
export class ClassModule {}
