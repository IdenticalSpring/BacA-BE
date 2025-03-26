import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSkillBehaviorScore } from './studentskillbehaviorscore.entity';
import {
  CreateStudentSkillBehaviorScoreDto,
  UpdateStudentSkillBehaviorScoreDto,
} from './studentskillbehaviorscore.dto';

@Injectable()
export class StudentSkillBehaviorScoreService {
  constructor(
    @InjectRepository(StudentSkillBehaviorScore)
    private readonly repository: Repository<StudentSkillBehaviorScore>,
  ) {}

  async findAll(): Promise<StudentSkillBehaviorScore[]> {
    return await this.repository.find({
      relations: ['teacherComment', 'skill'],
    });
  }

  async findOne(id: number): Promise<StudentSkillBehaviorScore> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['teacherComment', 'skill'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateStudentSkillBehaviorScoreDto,
  ): Promise<StudentSkillBehaviorScore> {
    const record = this.repository.create(dto);
    return await this.repository.save(record);
  }

  async update(
    id: number,
    dto: UpdateStudentSkillBehaviorScoreDto,
  ): Promise<StudentSkillBehaviorScore> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return await this.repository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.repository.remove(record);
  }
}
