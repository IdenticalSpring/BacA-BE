import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { TestSkillsService } from './test_skills.service';
import { CreateTestSkillDto, UpdateTestSkillDto } from './test_skills.dto';
import { TestSkill } from './test_skills.entity';

@Controller('test-skills')
export class TestSkillsController {
  constructor(private readonly testSkillsService: TestSkillsService) {}

  @Get()
  async findAll(): Promise<TestSkill[]> {
    return this.testSkillsService.findAll();
  }

  @Post()
  async create(
    @Body() createTestSkillDto: CreateTestSkillDto,
  ): Promise<TestSkill> {
    return this.testSkillsService.create(createTestSkillDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTestSkillDto: UpdateTestSkillDto,
  ): Promise<TestSkill> {
    return this.testSkillsService.update(id, updateTestSkillDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.testSkillsService.remove(id);
  }
}
