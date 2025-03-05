import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherCommentOnStudent } from './teachercommentonstudent.entity';
import {
  CreateTeacherCommentOnStudentDto,
  UpdateTeacherCommentOnStudentDto,
} from './teachercommentonstudent.dto';

@Injectable()
export class TeacherCommentOnStudentService {
  constructor(
    @InjectRepository(TeacherCommentOnStudent)
    private readonly teacherCommentOnStudentRepository: Repository<TeacherCommentOnStudent>,
  ) {}

  async findAll(): Promise<TeacherCommentOnStudent[]> {
    return await this.teacherCommentOnStudentRepository.find({
      relations: ['teacher', 'student', 'schedule'],
    });
  }

  async findOne(id: number): Promise<TeacherCommentOnStudent> {
    const comment = await this.teacherCommentOnStudentRepository.findOne({
      where: { id },
      relations: ['teacher', 'student', 'schedule'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async create(
    createDto: CreateTeacherCommentOnStudentDto,
  ): Promise<TeacherCommentOnStudent> {
    const comment = this.teacherCommentOnStudentRepository.create(createDto);
    return await this.teacherCommentOnStudentRepository.save(comment);
  }

  async update(
    id: number,
    updateDto: UpdateTeacherCommentOnStudentDto,
  ): Promise<TeacherCommentOnStudent> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateDto);
    return await this.teacherCommentOnStudentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.teacherCommentOnStudentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
}
