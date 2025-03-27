import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSkill } from './test_skills.entity';
import { CreateTestSkillDto, UpdateTestSkillDto } from './test_skills.dto';

@Injectable()
export class TestSkillsService {
  constructor(
    @InjectRepository(TestSkill)
    private readonly testSkillsRepository: Repository<TestSkill>,
  ) {}

  async findAll(): Promise<TestSkill[]> {
    return this.testSkillsRepository.find();
  }

  async create(createTestSkillDto: CreateTestSkillDto): Promise<TestSkill> {
    const testSkill = this.testSkillsRepository.create(createTestSkillDto);
    return this.testSkillsRepository.save(testSkill);
  }

  async update(
    id: number,
    updateTestSkillDto: UpdateTestSkillDto,
  ): Promise<TestSkill> {
    const testSkill = await this.testSkillsRepository.findOne({
      where: { id },
    });
    if (!testSkill) {
      throw new NotFoundException(`TestSkill with ID ${id} not found`);
    }
    Object.assign(testSkill, updateTestSkillDto);
    return this.testSkillsRepository.save(testSkill);
  }

  async remove(id: number): Promise<void> {
    const testSkill = await this.testSkillsRepository.findOne({
      where: { id },
    });
    if (!testSkill) {
      throw new NotFoundException(`TestSkill with ID ${id} not found`);
    }
    await this.testSkillsRepository.remove(testSkill);
  }
}
