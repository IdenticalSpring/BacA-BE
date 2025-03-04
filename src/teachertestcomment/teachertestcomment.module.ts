import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherTestComment } from './teachertestcomment.entity';
import { TeacherTestCommentService } from './teachertestcomment.service';
import { TeacherTestCommentController } from './teachertestcomment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherTestComment])],
  providers: [TeacherTestCommentService],
  controllers: [TeacherTestCommentController],
  exports: [TypeOrmModule],
})
export class TeacherTestCommentModule {}
