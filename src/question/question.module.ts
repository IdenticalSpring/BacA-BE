import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';
import { HomeWork } from '../homeWork/homeWork.entity'; // Thêm dòng này

@Module({
  imports: [TypeOrmModule.forFeature([Question, Teacher, Class, HomeWork])], // Thêm HomeWork vào đây
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
