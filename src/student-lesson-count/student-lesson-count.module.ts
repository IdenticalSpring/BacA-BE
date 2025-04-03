import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student_lesson_count } from './student-lesson-count.entity';
import { Student } from 'src/student/student.entity';
import { Lesson } from 'src/lesson/lesson.entity';
import { StudentModule } from 'src/student/student.module';
import { LessonModule } from 'src/lesson/lesson.module';
import { Student_lesson_countService } from './student-lesson-count.service';
import { Student_lesson_countController } from './student-lesson-count.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student_lesson_count, Student, Lesson]),
    forwardRef(() => StudentModule),
    forwardRef(() => LessonModule),
  ],
  providers: [Student_lesson_countService],
  controllers: [Student_lesson_countController],
  exports: [TypeOrmModule, Student_lesson_countService],
})
export class Student_lesson_countModule {}
