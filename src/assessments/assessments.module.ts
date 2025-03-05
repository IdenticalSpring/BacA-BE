import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessments } from './assessments.entity';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assessments])],
  providers: [AssessmentsService],
  controllers: [AssessmentsController],
  exports: [TypeOrmModule],
})
export class AssessmentsModule {}
