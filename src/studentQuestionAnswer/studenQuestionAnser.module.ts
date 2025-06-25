import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentQuestionAnswer } from './studenQuestionAnser.entity';
import { StudentQuestionAnswerService } from './studenQuestionAnser.service';
import { StudentQuestionAnswerController } from './studenQuestionAnser.controller';
import { Question } from '../question/question.entity';
import { Student } from '../student/student.entity';
import { HomeWork } from '../homeWork/homeWork.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentQuestionAnswer,
      Question,
      Student,
      HomeWork,
    ]),
  ],
  providers: [StudentQuestionAnswerService],
  controllers: [StudentQuestionAnswerController],
})
export class StudentQuestionAnswerModule {}
