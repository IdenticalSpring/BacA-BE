import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student_lesson_count } from './student-lesson-count.entity';
import * as dotenv from 'dotenv';
import { Lesson } from 'src/lesson/lesson.entity';
import { Student } from 'src/student/student.entity';
import {
  AllStudentOfClassDto,
  CreateStudent_lesson_countDto,
  UpdateCountDto,
  UpdateStudent_lesson_countDto,
} from './student-lesson-count.dto';
dotenv.config();
@Injectable()
export class Student_lesson_countService {
  constructor(
    @InjectRepository(Student_lesson_count)
    private readonly student_lesson_countRepository: Repository<Student_lesson_count>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Student_lesson_count[]> {
    return await this.student_lesson_countRepository.find({
      where: { isDelete: false },
      relations: ['student', 'lesson', 'lessonBySchedule'],
    });
  }
  async findOne(id: number): Promise<Student_lesson_count> {
    const lesson = await this.student_lesson_countRepository.findOne({
      where: { id, isDelete: false },
      relations: ['student', 'lesson', 'lessonBySchedule'],
    });
    if (!lesson) {
      throw new NotFoundException(`lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async create(
    createStudent_lesson_countDto: CreateStudent_lesson_countDto,
  ): Promise<Student_lesson_count> {
    const { lessonId, studentId, ...rest } = createStudent_lesson_countDto;

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId, isDelete: false },
    });

    if (!lesson) {
      throw new NotFoundException(`lesson with ID ${lessonId} not found`);
    }
    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDelete: false },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    // Tạo class và gán teacher
    const student_lesson_countEntity =
      this.student_lesson_countRepository.create({
        ...rest,
        lesson: lesson,
        student: student,
      });

    return await this.student_lesson_countRepository.save(
      student_lesson_countEntity,
    );
  }

  async update(
    id: number,
    updateStudent_lesson_countDto: UpdateStudent_lesson_countDto,
  ): Promise<Student_lesson_count> {
    const { lessonId, studentId, ...rest } = updateStudent_lesson_countDto;
    const student_lesson_countEntity = await this.findOne(id);
    if (!student_lesson_countEntity) {
      throw new NotFoundException(
        `student_lesson_count with ID ${id} not found`,
      );
    }
    if (lessonId !== undefined) {
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId, isDelete: false },
      });

      if (!lesson) {
        throw new NotFoundException(`lesson with ID ${lessonId} not found`);
      }
      student_lesson_countEntity.lesson = lesson;
    }
    if (studentId !== undefined) {
      const student = await this.studentRepository.findOne({
        where: { id: studentId, isDelete: false },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
      student_lesson_countEntity.student = student;
    }
    Object.assign(student_lesson_countEntity, rest);

    return await this.student_lesson_countRepository.save(
      student_lesson_countEntity,
    );
  }
  async updateCount(
    updateCountDto: UpdateCountDto,
  ): Promise<Student_lesson_count> {
    const { lessonId, studentId, ...rest } = updateCountDto;
    let lesson = null;
    if (lessonId !== undefined) {
      lesson = await this.lessonRepository.findOne({
        where: { id: lessonId, isDelete: false },
      });

      if (!lesson) {
        throw new NotFoundException(`lesson with ID ${lessonId} not found`);
      }
    }
    let student = null;
    if (studentId !== undefined) {
      student = await this.studentRepository.findOne({
        where: { id: studentId, isDelete: false },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
    }
    let student_lesson_countEntity =
      await this.student_lesson_countRepository.findOne({
        where: { student, lesson, isDelete: false },
      });
    if (!student_lesson_countEntity) {
      student_lesson_countEntity = this.student_lesson_countRepository.create({
        ...rest,
        count: 1,
        lesson: lesson,
        student: student,
      });
      return await this.student_lesson_countRepository.save(
        student_lesson_countEntity,
      );
    } else {
      student_lesson_countEntity.count++;
      return await this.student_lesson_countRepository.save(
        student_lesson_countEntity,
      );
    }
  }
  async getAllCountOfClass(
    allStudentOfClassDto: AllStudentOfClassDto,
  ): Promise<Student_lesson_count[]> {
    const student_lesson_count = await Promise.all(
      allStudentOfClassDto.students.map(async (std) => {
        const student = await this.studentRepository.findOne({
          where: { id: std.studentId },
        });
        return await this.student_lesson_countRepository.find({
          select: { id: true, count: true },
          where: { student, isDelete: false },
          relations: ['student', 'lesson', 'lessonBySchedule'],
        });
      }),
    );
    return student_lesson_count.flat();
  }
  async remove(id: number): Promise<void> {
    // const result = await this.lessonRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`lesson with ID ${id} not found`);
    // }
    const student_lesson_countEntity =
      await this.student_lesson_countRepository.findOne({
        where: { id, isDelete: false },
      });
    if (!student_lesson_countEntity) {
      throw new NotFoundException(
        `student_lesson_count with ID ${id} not found`,
      );
    }
    student_lesson_countEntity.isDelete = true;
    await this.lessonRepository.save(student_lesson_countEntity);
  }
}
