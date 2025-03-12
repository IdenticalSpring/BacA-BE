import { Injectable } from '@nestjs/common';

@Injectable()
export class TesttypeService {}
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestType } from './testtype.entity';
import { CreateTestTypeDto, UpdateTestTypeDto } from './testtype.dto';

@Injectable()
export class TestTypeService {
  constructor(
    @InjectRepository(TestType)
    private readonly testTypeRepository: Repository<TestType>,
  ) {}

  async findAll(): Promise<TestType[]> {
    return await this.testTypeRepository.find();
  }

  async findOne(id: number): Promise<TestType> {
    const testType = await this.testTypeRepository.findOne({ where: { id } });
    if (!testType) {
      throw new NotFoundException(`TestType with ID ${id} not found`);
    }
    return testType;
  }

  async create(createDto: CreateTestTypeDto): Promise<TestType> {
    const testType = this.testTypeRepository.create(createDto);
    return await this.testTypeRepository.save(testType);
  }

  async update(id: number, updateDto: UpdateTestTypeDto): Promise<TestType> {
    const testType = await this.findOne(id);
    Object.assign(testType, updateDto);
    return await this.testTypeRepository.save(testType);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.testTypeRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`TestType with ID ${id} not found`);
    // }
    const TestType = await this.testTypeRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!TestType) {
      throw new NotFoundException(`TestType with ID ${id} not found`);
    }
    TestType.isDelete = true;
    await this.testTypeRepository.save(TestType);
  }
}
