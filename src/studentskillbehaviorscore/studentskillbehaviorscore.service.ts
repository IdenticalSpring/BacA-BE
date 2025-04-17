import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
  async getEvaluationSkillStudent(
    studentID: number,
  ): Promise<StudentSkillBehaviorScore[]> {
    return await this.repository.find({
      where: { studentID },
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

  async getScoresByDate(date: string): Promise<StudentSkillBehaviorScore[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    return await this.repository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['teacherComment', 'skill'],
    });
  }

  async updateScoresByDate(
    date: string,
    updateData: Partial<StudentSkillBehaviorScore>,
  ): Promise<StudentSkillBehaviorScore[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    const scores = await this.repository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['teacherComment', 'skill'],
    });

    if (!scores || scores.length === 0) {
      throw new NotFoundException(`No scores found for date ${date}`);
    }

    const updatedScores = scores.map((score) => {
      return Object.assign(score, updateData);
    });

    return this.repository.save(updatedScores);
  }

  async updateScoreByStudentAndDate(
    studentID: number,
    date: string,
    updateData: Partial<StudentSkillBehaviorScore>,
  ): Promise<StudentSkillBehaviorScore[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    const scores = await this.repository.find({
      where: {
        studentID,
        date: Between(startDate, endDate),
      },
      relations: ['teacherComment', 'skill'],
    });

    if (!scores || scores.length === 0) {
      throw new NotFoundException(
        `No scores found for studentID ${studentID} on date ${date}`,
      );
    }

    const updatedScores = scores.map((score) => {
      return Object.assign(score, updateData);
    });

    return this.repository.save(updatedScores);
  }
}
