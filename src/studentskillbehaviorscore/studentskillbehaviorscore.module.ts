import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentSkillBehaviorScore } from './studentskillbehaviorscore.entity';
import { StudentSkillBehaviorScoreService } from './studentskillbehaviorscore.service';
import { StudentSkillBehaviorScoreController } from './studentskillbehaviorscore.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentSkillBehaviorScore])],
  controllers: [StudentSkillBehaviorScoreController],
  providers: [StudentSkillBehaviorScoreService],
})
export class StudentSkillBehaviorScoreModule {}
