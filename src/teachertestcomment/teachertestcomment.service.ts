import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherTestComment } from './teachertestcomment.entity';
import {
  CreateTeacherTestCommentDto,
  UpdateTeacherTestCommentDto,
} from './teachertestcomment.dto';

@Injectable()
export class TeacherTestCommentService {
  constructor(
    @InjectRepository(TeacherTestComment)
    private readonly repository: Repository<TeacherTestComment>,
  ) {}

  async findAll(): Promise<TeacherTestComment[]> {
    return await this.repository.find({
      relations: ['teacher', 'student', 'classEntity', 'schedule'],
    });
  }

  async findOne(id: number): Promise<TeacherTestComment> {
    const comment = await this.repository.findOne({
      where: { id },
      relations: ['teacher', 'student', 'classEntity', 'schedule'],
    });
    if (!comment) {
      throw new NotFoundException(`TeacherTestComment with ID ${id} not found`);
    }
    return comment;
  }

  async create(
    createDto: CreateTeacherTestCommentDto,
  ): Promise<TeacherTestComment> {
    const comment = this.repository.create(createDto);
    return await this.repository.save(comment);
  }

  async update(
    id: number,
    updateDto: UpdateTeacherTestCommentDto,
  ): Promise<TeacherTestComment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateDto);
    return await this.repository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`TeacherTestComment with ID ${id} not found`);
    }
  }
}
