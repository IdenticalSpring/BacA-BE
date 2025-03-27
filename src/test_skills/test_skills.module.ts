import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSkill } from './test_skills.entity';
import { TestSkillsService } from './test_skills.service';
import { TestSkillsController } from './test_skills.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestSkill])],
  controllers: [TestSkillsController],
  providers: [TestSkillsService],
})
export class TestSkillsModule {}
