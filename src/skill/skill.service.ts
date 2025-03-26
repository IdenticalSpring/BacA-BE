import { InjectRepository } from '@nestjs/typeorm';
import { Skills } from './skill.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto, UpdateSkillDto } from './skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skills)
    private readonly skillRepository: Repository<Skills>,
  ) {}
  async findAll(): Promise<Skills[]> {
    return await this.skillRepository.find();
  }
  async findOne(id: number): Promise<Skills> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async create(createSkillDto: CreateSkillDto): Promise<Skills> {
    const skill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(skill);
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skills> {
    const skill = await this.findOne(id);
    Object.assign(skill, updateSkillDto);
    return await this.skillRepository.save(skill);
  }

  async remove(id: number): Promise<void> {
    const skill = await this.findOne(id);
    await this.skillRepository.remove(skill);
  }
}
