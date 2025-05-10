import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student_vocabulary } from './student_vocabulary.entity';
import { Student } from 'src/student/student.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { Vocabulary } from 'src/vocabulary/vocabulary.entity';
import { StudentModule } from 'src/student/student.module';
import { HomeWorkModule } from 'src/homeWork/homeWork.module';
import { VocabularyModule } from 'src/vocabulary/vocabulary.module';
import { Student_vocabularyService } from './student_vocabulary.service';
import { Student_vocabularyController } from './student_vocabulary.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student_vocabulary,
      Student,
      HomeWork,
      Vocabulary,
    ]),
    forwardRef(() => StudentModule),
    forwardRef(() => HomeWorkModule),
    forwardRef(() => VocabularyModule),
  ],
  providers: [Student_vocabularyService],
  controllers: [Student_vocabularyController],
  exports: [TypeOrmModule, Student_vocabularyService],
})
export class Student_vocabularyModule {}
