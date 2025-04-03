import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student_homework_count } from './student_homework_count.entity';
import { Student_homework_countService } from './student_homework_count.service';
import { Student_homework_countController } from './student_homework_count.controller';
import { Student } from 'src/student/student.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { StudentModule } from 'src/student/student.module';
import { HomeWorkModule } from 'src/homeWork/homeWork.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student_homework_count, Student, HomeWork]),
    forwardRef(() => StudentModule),
    forwardRef(() => HomeWorkModule),
  ],
  providers: [Student_homework_countService],
  controllers: [Student_homework_countController],
  exports: [TypeOrmModule, Student_homework_countService],
})
export class Student_homework_countModule {}
