import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestEntity } from './test.entity';
import { CreateTestDto } from './test.dto';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
  ) {}

  async create(createTestDto: CreateTestDto): Promise<TestEntity> {
    const testEntity = this.testRepository.create(createTestDto);
    return this.testRepository.save(testEntity);
  }

  async findAll(): Promise<TestEntity[]> {
    return this.testRepository.find();
  }

  async findOne(id: number): Promise<TestEntity> {
    return this.testRepository.findOneBy({ id });
  }

  async update(id: number, updateTestDto: CreateTestDto): Promise<TestEntity> {
    await this.testRepository.update(id, updateTestDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.testRepository.delete(id);
  }
}
