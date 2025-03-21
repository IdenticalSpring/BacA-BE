import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Lesson } from 'src/lesson/lesson.entity';
import { LessonModule } from 'src/lesson/lesson.module';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { HomeWorkModule } from 'src/homeWork/homeWork.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Lesson, HomeWork]),
    forwardRef(() => LessonModule),
    forwardRef(() => HomeWorkModule),
  ],
  providers: [TeacherService],
  controllers: [TeacherController],
  exports: [TypeOrmModule, TeacherService],
})
export class TeacherModule {}
