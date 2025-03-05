import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherCommentOnStudent } from './teachercommentonstudent.entity';
import { TeacherCommentOnStudentService } from './teachercommentonstudent.service';
import { TeacherCommentOnStudentController } from './teachercommentonstudent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherCommentOnStudent])],
  providers: [TeacherCommentOnStudentService],
  controllers: [TeacherCommentOnStudentController],
  exports: [TypeOrmModule],
})
export class TeacherCommentOnStudentModule {}
