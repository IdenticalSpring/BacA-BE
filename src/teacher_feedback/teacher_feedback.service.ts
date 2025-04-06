import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherFeedback } from './teacher_feedback.entity';
import {
  CreateTeacherFeedbackDto,
  UpdateTeacherFeedbackDto,
} from './teacher_feedback.dto';

@Injectable()
export class TeacherFeedbackService {
  constructor(
    @InjectRepository(TeacherFeedback)
    private readonly teacherFeedbackRepository: Repository<TeacherFeedback>,
  ) {}

  async createFeedback(
    dto: CreateTeacherFeedbackDto,
  ): Promise<TeacherFeedback> {
    const feedback = this.teacherFeedbackRepository.create({
      ...dto,
      teacher: { id: dto.teacherID },
    });
    return this.teacherFeedbackRepository.save(feedback);
  }

  async getAllFeedbacks(): Promise<TeacherFeedback[]> {
    return this.teacherFeedbackRepository.find({ relations: ['teacher'] });
  }

  async getFeedbackById(id: number): Promise<TeacherFeedback> {
    return this.teacherFeedbackRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
  }

  async updateFeedback(
    id: number,
    dto: UpdateTeacherFeedbackDto,
  ): Promise<TeacherFeedback> {
    await this.teacherFeedbackRepository.update(id, {
      ...dto,
      teacher: dto.teacherID ? { id: dto.teacherID } : undefined,
    });
    return this.getFeedbackById(id);
  }

  async deleteFeedback(id: number): Promise<void> {
    await this.teacherFeedbackRepository.delete(id);
  }
  async findFeedbackByTeacherID(teacherID: number): Promise<TeacherFeedback[]> {
    return this.teacherFeedbackRepository.find({
      where: { teacher: { id: teacherID } },
      relations: ['teacher'],
    });
  }
}
