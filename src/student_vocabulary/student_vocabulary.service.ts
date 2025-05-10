import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student_vocabulary } from './student_vocabulary.entity';
import {
  CreateStudentVocabularyDto,
  findAllStudentVocabulariesByHomeworkIdAndStudentIdDto,
  UpdateStudentVocabularyDto,
} from './student_vocabulary.dto';
import * as dotenv from 'dotenv';
import { Student } from 'src/student/student.entity';
import { Vocabulary } from 'src/vocabulary/vocabulary.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
dotenv.config();
@Injectable()
export class Student_vocabularyService {
  constructor(
    @InjectRepository(Student_vocabulary)
    private readonly student_vocabularyRepository: Repository<Student_vocabulary>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(HomeWork)
    private readonly homeworkRepository: Repository<HomeWork>,
  ) {}

  async findAll(): Promise<Student_vocabulary[]> {
    return await this.student_vocabularyRepository.find({
      where: { isDelete: false },
      relations: ['student', 'vocabulary', 'homework'],
    });
  }
  async findAllStudentVocabulariesByHomeworkIdAndStudentId(
    findAllStudentVocabulariesByHomeworkIdAndStudentId: findAllStudentVocabulariesByHomeworkIdAndStudentIdDto,
  ): Promise<Student_vocabulary[]> {
    const homework = await this.homeworkRepository.find({
      where: {
        id: findAllStudentVocabulariesByHomeworkIdAndStudentId.homeworkId,
      },
    });
    if (!homework) {
      throw new NotFoundException(
        `Homework with ID ${findAllStudentVocabulariesByHomeworkIdAndStudentId.homeworkId} not found`,
      );
    }
    const student = await this.studentRepository.find({
      where: {
        id: findAllStudentVocabulariesByHomeworkIdAndStudentId.studentId,
      },
    });
    if (!student) {
      throw new NotFoundException(
        `Student with ID ${findAllStudentVocabulariesByHomeworkIdAndStudentId.studentId} not found`,
      );
    }
    return await this.student_vocabularyRepository.find({
      where: {
        homework,
        student,
        isDelete: false,
      },
      relations: ['student', 'vocabulary', 'homework'],
    });
  }
  async findOne(id: number): Promise<Student_vocabulary> {
    const student_vocabulary = await this.student_vocabularyRepository.findOne({
      where: { id, isDelete: false },
      relations: ['student', 'vocabulary', 'homework'],
    });
    if (!student_vocabulary) {
      throw new NotFoundException(`Student_vocabulary with ID ${id} not found`);
    }
    return student_vocabulary;
  }

  async create(
    createStudentVocabularyDto: CreateStudentVocabularyDto,
  ): Promise<Student_vocabulary> {
    const { vocabularyId, homeworkId, studentId, ...rest } =
      createStudentVocabularyDto;

    // Tìm teacher theo ID
    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDelete: false },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId, isDelete: false },
    });

    if (!vocabulary) {
      throw new NotFoundException(
        `vocabulary with ID ${vocabularyId} not found`,
      );
    }
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });

    if (!homework) {
      throw new NotFoundException(`homework with ID ${homeworkId} not found`);
    }
    const student_vocabularyEntity =
      await this.student_vocabularyRepository.findOne({
        where: {
          student,
          vocabulary,
          homework,
          isDelete: false,
        },
      });
    if (student_vocabularyEntity) {
      return this.update(student_vocabularyEntity.id, {
        vocabularyId,
        homeworkId,
        studentId,
        ...rest,
      });
    }
    // Tạo class và gán teacher
    const student_vocabulary = this.student_vocabularyRepository.create({
      ...rest,
      student,
      homework,
      vocabulary,
    });

    return await this.student_vocabularyRepository.save(student_vocabulary);
  }

  async update(
    id: number,
    updateStudentVocabularyDto: UpdateStudentVocabularyDto,
  ): Promise<Student_vocabulary> {
    const { vocabularyId, homeworkId, studentId, ...rest } =
      updateStudentVocabularyDto;
    // Tìm class cần update
    const student_vocabularyEntity = await this.findOne(id);
    if (!student_vocabularyEntity) {
      throw new NotFoundException(`student_vocabulary with ID ${id} not found`);
    }
    if (vocabularyId !== undefined) {
      const vocabulary = await this.vocabularyRepository.findOne({
        where: { id: vocabularyId },
      });

      if (!vocabulary) {
        throw new NotFoundException(
          `vocabulary with ID ${vocabularyId} not found`,
        );
      }

      student_vocabularyEntity.vocabulary = vocabulary;
    }
    if (studentId !== undefined) {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new NotFoundException(`student with ID ${studentId} not found`);
      }

      student_vocabularyEntity.student = student;
    }
    if (homeworkId !== undefined) {
      const homework = await this.homeworkRepository.findOne({
        where: { id: homeworkId },
      });

      if (!homework) {
        throw new NotFoundException(`homework with ID ${homeworkId} not found`);
      }

      student_vocabularyEntity.homework = homework;
    }

    // Cập nhật các field còn lại
    Object.assign(student_vocabularyEntity, rest);

    return await this.student_vocabularyRepository.save(
      student_vocabularyEntity,
    );
  }
  async remove(id: number): Promise<void> {
    // const result = await this.homeWorkRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`HomeWork with ID ${id} not found`);
    // }
    const student_vocabulary = await this.student_vocabularyRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!student_vocabulary) {
      throw new NotFoundException(`student_vocabulary with ID ${id} not found`);
    }
    student_vocabulary.isDelete = true;
    await this.student_vocabularyRepository.save(student_vocabulary);
  }
}
