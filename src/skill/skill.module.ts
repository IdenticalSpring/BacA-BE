import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { Skills } from './skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skills])],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
