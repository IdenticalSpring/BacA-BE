import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentScoreDetails } from './student_score_details.entity';
import { StudentScoreDetailsService } from './student_score_details.service';
import { StudentScoreDetailsController } from './student_score_details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentScoreDetails])],
  controllers: [StudentScoreDetailsController],
  providers: [StudentScoreDetailsService],
})
export class StudentScoreDetailsModule {}
