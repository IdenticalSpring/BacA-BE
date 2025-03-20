import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassTestScheduleEntity } from './classTestSchedule.entity';
import { CreateClassTestScheduleDto } from './classTestSchedule.dto';

@Injectable()
export class ClassTestScheduleService {
  constructor(
    @InjectRepository(ClassTestScheduleEntity)
    private readonly classTestScheduleRepository: Repository<ClassTestScheduleEntity>,
  ) {}

  async create(
    createClassTestScheduleDto: CreateClassTestScheduleDto,
  ): Promise<ClassTestScheduleEntity> {
    const classTestScheduleEntity = this.classTestScheduleRepository.create(
      createClassTestScheduleDto,
    );
    return this.classTestScheduleRepository.save(classTestScheduleEntity);
  }

  async findAll(): Promise<ClassTestScheduleEntity[]> {
    return this.classTestScheduleRepository.find();
  }

  async findOne(id: number): Promise<ClassTestScheduleEntity> {
    return this.classTestScheduleRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateClassTestScheduleDto: CreateClassTestScheduleDto,
  ): Promise<ClassTestScheduleEntity> {
    await this.classTestScheduleRepository.update(
      id,
      updateClassTestScheduleDto,
    );
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.classTestScheduleRepository.delete(id);
  }
}
