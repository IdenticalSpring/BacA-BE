import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentQuestionAnswer } from './studenQuestionAnser.entity';
import {
  CreateStudentQuestionAnswerDto,
  UpdateStudentQuestionAnswerDto,
} from './studenQuestionAnser.dto';
import { Question } from '../question/question.entity';
import { Student } from '../student/student.entity';
import { HomeWork } from '../homeWork/homeWork.entity';

@Injectable()
export class StudentQuestionAnswerService {
  constructor(
    @InjectRepository(StudentQuestionAnswer)
    private readonly studentQuestionAnswerRepository: Repository<StudentQuestionAnswer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>,
  ) {}

  async create(
    dto: CreateStudentQuestionAnswerDto,
  ): Promise<StudentQuestionAnswer> {
    const question = await this.questionRepository.findOneBy({
      id: dto.questionID,
    });
    const student = await this.studentRepository.findOneBy({
      id: dto.studentId,
    });
    let homeWork = null;
    if (dto.homeWorkId) {
      homeWork = await this.homeWorkRepository.findOneBy({
        id: dto.homeWorkId,
      });
    }
    const entity = this.studentQuestionAnswerRepository.create({
      question,
      student,
      homeWork,
      answer: dto.answer,
      text: dto.text,
      audio: dto.audio,
      isDelete: dto.isDelete,
    });
    return this.studentQuestionAnswerRepository.save(entity);
  }

  async findAll(): Promise<StudentQuestionAnswer[]> {
    return this.studentQuestionAnswerRepository.find();
  }

  async findOne(id: number): Promise<StudentQuestionAnswer> {
    return this.studentQuestionAnswerRepository.findOneBy({ id });
  }

  async update(
    id: number,
    dto: UpdateStudentQuestionAnswerDto,
  ): Promise<StudentQuestionAnswer> {
    const updateData: any = { ...dto };
    if (dto.studentId) {
      updateData.student = await this.studentRepository.findOneBy({
        id: dto.studentId,
      });
    }
    if (dto.homeWorkId) {
      updateData.homeWork = await this.homeWorkRepository.findOneBy({
        id: dto.homeWorkId,
      });
    }
    await this.studentQuestionAnswerRepository.update(id, updateData);
    return this.findOne(id);
  }

  async findByHomeWorkId(homeWorkId: number): Promise<StudentQuestionAnswer[]> {
    return this.studentQuestionAnswerRepository.find({
      where: { homeWork: { id: homeWorkId } },
    });
  }

  async findByQuestionAndStudent(
    questionId: number,
    studentId: number,
  ): Promise<StudentQuestionAnswer[]> {
    return this.studentQuestionAnswerRepository.find({
      where: {
        question: { id: questionId },
        student: { id: studentId },
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.studentQuestionAnswerRepository.delete(id);
  }
}
