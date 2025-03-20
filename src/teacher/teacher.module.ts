import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Lesson } from 'src/lesson/lesson.entity';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Lesson]),
    forwardRef(() => LessonModule),
  ],
  providers: [TeacherService],
  controllers: [TeacherController],
  exports: [TypeOrmModule, TeacherService],
})
export class TeacherModule {}
