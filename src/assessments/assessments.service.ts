import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessments } from './assessments.entity';
import { CreateAssessmentsDto, UpdateAssessmentsDto } from './assessments.dto';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessments)
    private readonly assessmentsRepository: Repository<Assessments>,
  ) {}

  async findAll(): Promise<Assessments[]> {
    return await this.assessmentsRepository.find({
      where: { isDelete: false },
    });
  }

  async findOne(id: number): Promise<Assessments> {
    const assessment = await this.assessmentsRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }
    return assessment;
  }

  async create(
    createAssessmentsDto: CreateAssessmentsDto,
  ): Promise<Assessments> {
    const assessment = this.assessmentsRepository.create(createAssessmentsDto);
    return await this.assessmentsRepository.save(assessment);
  }

  async update(
    id: number,
    updateAssessmentsDto: UpdateAssessmentsDto,
  ): Promise<Assessments> {
    const assessment = await this.findOne(id);
    Object.assign(assessment, updateAssessmentsDto);
    return await this.assessmentsRepository.save(assessment);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.assessmentsRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Assessment with ID ${id} not found`);
    // }
    const assessment = await this.assessmentsRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }
    assessment.isDelete = true;
    await this.assessmentsRepository.save(assessment);
  }
}
