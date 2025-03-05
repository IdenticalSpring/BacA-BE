import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResult } from './testresult.entity';
import { CreateTestResultDto, UpdateTestResultDto } from './testresult.dto';

@Injectable()
export class TestResultService {
  constructor(
    @InjectRepository(TestResult)
    private readonly testResultRepository: Repository<TestResult>,
  ) {}

  async findAll(): Promise<TestResult[]> {
    return await this.testResultRepository.find({
      relations: [
        'student',
        'classEntity',
        'testType',
        'assessments',
        'teacherComment',
      ],
    });
  }

  async findOne(id: number): Promise<TestResult> {
    const testResult = await this.testResultRepository.findOne({
      where: { id },
      relations: [
        'student',
        'classEntity',
        'testType',
        'assessments',
        'teacherComment',
      ],
    });
    if (!testResult) {
      throw new NotFoundException(`TestResult with ID ${id} not found`);
    }
    return testResult;
  }

  async create(createDto: CreateTestResultDto): Promise<TestResult> {
    const testResult = this.testResultRepository.create(createDto);
    return await this.testResultRepository.save(testResult);
  }

  async update(
    id: number,
    updateDto: UpdateTestResultDto,
  ): Promise<TestResult> {
    const testResult = await this.findOne(id);
    Object.assign(testResult, updateDto);
    return await this.testResultRepository.save(testResult);
  }

  async remove(id: number): Promise<void> {
    const result = await this.testResultRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`TestResult with ID ${id} not found`);
    }
  }
}
