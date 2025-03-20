import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentScoreService } from './studentScore.service';
import { StudentScoreEntity } from './studentScore.entity';
import { StudentScoreController } from './studentScore.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentScoreEntity])],
  providers: [StudentScoreService],
  controllers: [StudentScoreController],
  exports: [StudentScoreService],
})
export class StudentScoreModule {}
