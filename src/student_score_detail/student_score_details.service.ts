import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentScoreDetails } from './student_score_details.entity';
import {
  CreateStudentScoreDetailsDto,
  UpdateStudentScoreDetailsDto,
} from './student_score_details.dto';

@Injectable()
export class StudentScoreDetailsService {
  constructor(
    @InjectRepository(StudentScoreDetails)
    private readonly studentScoreDetailsRepository: Repository<StudentScoreDetails>,
  ) {}

  async findAll(): Promise<StudentScoreDetails[]> {
    return this.studentScoreDetailsRepository.find({
      relations: ['studentScore', 'testSkill'], // Lấy thông tin khóa ngoại
    });
  }

  async findOne(id: number): Promise<StudentScoreDetails> {
    const detail = await this.studentScoreDetailsRepository.findOne({
      where: { id },
      relations: ['studentScore', 'testSkill'], // Lấy thông tin khóa ngoại
    });
    if (!detail) {
      throw new NotFoundException(
        `StudentScoreDetails with ID ${id} not found`,
      );
    }
    return detail;
  }

  async create(
    createDto: CreateStudentScoreDetailsDto,
  ): Promise<StudentScoreDetails> {
    const detail = this.studentScoreDetailsRepository.create(createDto);
    return this.studentScoreDetailsRepository.save(detail);
  }

  async update(
    id: number,
    updateDto: UpdateStudentScoreDetailsDto,
  ): Promise<StudentScoreDetails> {
    const detail = await this.findOne(id);
    Object.assign(detail, updateDto);
    return this.studentScoreDetailsRepository.save(detail);
  }
  async getScoreDetailsByStudentId(
    studentId: number,
  ): Promise<StudentScoreDetails[]> {
    return this.studentScoreDetailsRepository.find({
      where: { studentScore: { student: { id: studentId } } },
      relations: ['studentScore', 'testSkill'], // Lấy thông tin khóa ngoại
    });
  }

  async remove(id: number): Promise<void> {
    const detail = await this.findOne(id);
    await this.studentScoreDetailsRepository.remove(detail);
  }
}
