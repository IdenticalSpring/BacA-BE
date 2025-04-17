import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

  async getEvaluationByStudentID(
    studentID: number,
  ): Promise<TeacherCommentOnStudent[]> {
    return this.teacherCommentOnStudentRepository.find({
      where: { student: { id: studentID }, isDelete: false },
      relations: ['teacher', 'student', 'schedule'],
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
  async getCommentsByDate(date: string): Promise<TeacherCommentOnStudent[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    return this.teacherCommentOnStudentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.teacher', 'teacher')
      .leftJoinAndSelect('comment.student', 'student')
      .leftJoinAndSelect('comment.schedule', 'schedule')
      .where('comment.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('comment.isDelete = :isDelete', { isDelete: false })
      .getMany();
  }
  async updateCommentByStudentAndDate(
    studentID: number,
    date: string,
    updateData: Partial<TeacherCommentOnStudent>,
  ): Promise<TeacherCommentOnStudent[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    const comments = await this.teacherCommentOnStudentRepository.find({
      where: {
        student: { id: studentID },
        date: Between(startDate, endDate),
        isDelete: false,
      },
      relations: ['teacher', 'student', 'schedule'],
    });

    if (!comments || comments.length === 0) {
      throw new NotFoundException(
        `No comments found for studentID ${studentID} on date ${date}`,
      );
    }

    const updatedComments = comments.map((comment) => {
      return Object.assign(comment, updateData);
    });

    return this.teacherCommentOnStudentRepository.save(updatedComments);
  }
}
