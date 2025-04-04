import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentScoreEntity } from './studentScore.entity';
import { CreateStudentScoreDto } from './studentScore.dto';

@Injectable()
export class StudentScoreService {
  constructor(
    @InjectRepository(StudentScoreEntity)
    private readonly studentScoreRepository: Repository<StudentScoreEntity>,
  ) {}

  async create(
    createStudentScoreDto: CreateStudentScoreDto,
  ): Promise<StudentScoreEntity> {
    const studentScoreEntity = this.studentScoreRepository.create(
      createStudentScoreDto,
    );
    return this.studentScoreRepository.save(studentScoreEntity);
  }

  async findAll(): Promise<StudentScoreEntity[]> {
    return this.studentScoreRepository.find({
      relations: ['student', 'classTestSchedule', 'teacher', 'assessment'],
    });
  }

  async findOne(id: number): Promise<StudentScoreEntity> {
    return this.studentScoreRepository.findOne({
      where: { id },
      relations: ['student', 'classTestSchedule', 'teacher', 'assessment'],
    });
  }

  async findByStudentId(studentID: number): Promise<StudentScoreEntity[]> {
    return this.studentScoreRepository.find({
      where: { studentID },
      relations: ['student', 'classTestSchedule', 'teacher', 'assessment'],
    });
  }

  async update(
    id: number,
    updateStudentScoreDto: CreateStudentScoreDto,
  ): Promise<StudentScoreEntity> {
    await this.studentScoreRepository.update(id, updateStudentScoreDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.studentScoreRepository.delete(id);
  }
}
