import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherCommentOnStudent } from './teachercommentonstudent.entity';
import {
  CreateTeacherCommentOnStudentDto,
  UpdateTeacherCommentOnStudentDto,
} from './teachercommentonstudent.dto';
import { Teacher } from 'src/teacher/teacher.entity';
import { Student } from 'src/student/student.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Injectable()
export class TeacherCommentOnStudentService {
  constructor(
    @InjectRepository(TeacherCommentOnStudent)
    private readonly teacherCommentOnStudentRepository: Repository<TeacherCommentOnStudent>,
  ) {}

  async findAll(): Promise<TeacherCommentOnStudent[]> {
    return await this.teacherCommentOnStudentRepository.find({
      relations: ['teacher', 'student', 'schedule'],
      where: { isDelete: false },
    });
  }

  async findOne(id: number): Promise<TeacherCommentOnStudent> {
    const comment = await this.teacherCommentOnStudentRepository.findOne({
      where: { id, isDelete: false },
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
    const { teacherID, studentID, scheduleID, ...rest } = createDto;

    const teacher =
      await this.teacherCommentOnStudentRepository.manager.findOneBy(Teacher, {
        id: teacherID,
      });
    const student =
      await this.teacherCommentOnStudentRepository.manager.findOneBy(Student, {
        id: studentID,
      });
    const schedule =
      await this.teacherCommentOnStudentRepository.manager.findOneBy(Schedule, {
        id: scheduleID,
      });

    if (!teacher || !student || !schedule) {
      throw new NotFoundException('Teacher, Student, or Schedule not found');
    }

    const comment = this.teacherCommentOnStudentRepository.create({
      teacher,
      student,
      schedule,
      ...rest,
    });

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
    const Comment = await this.teacherCommentOnStudentRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    Comment.isDelete = true;
    await this.teacherCommentOnStudentRepository.save(Comment);
  }
}
