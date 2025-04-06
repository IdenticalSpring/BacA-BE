import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherFeedback } from './teacher_feedback.entity';
import { TeacherFeedbackService } from './teacher_feedback.service';
import { TeacherFeedbackController } from './teacher_feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherFeedback])],
  controllers: [TeacherFeedbackController],
  providers: [TeacherFeedbackService],
})
export class TeacherFeedbackModule {}
