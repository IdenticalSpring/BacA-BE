import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Student } from 'src/student/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Student])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
