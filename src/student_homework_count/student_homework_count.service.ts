import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student_homework_count } from './student_homework_count.entity';
import {
  AllStudentOfClassDto,
  CreateStudent_homework_countDto,
  UpdateCountDto,
  UpdateStudent_homework_countDto,
} from './student_homework_count.dto';
import * as dotenv from 'dotenv';
import { Student } from 'src/student/student.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
dotenv.config();
@Injectable()
export class Student_homework_countService {
  constructor(
    @InjectRepository(Student_homework_count)
    private readonly student_homework_countRepository: Repository<Student_homework_count>,
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Student_homework_count[]> {
    return await this.student_homework_countRepository.find({
      where: { isDelete: false },
      relations: ['student', 'homework'],
    });
  }
  async findOne(id: number): Promise<Student_homework_count> {
    const homeWork = await this.student_homework_countRepository.findOne({
      where: { id, isDelete: false },
      relations: ['student', 'homework'],
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    return homeWork;
  }

  async create(
    createStudent_homework_countDto: CreateStudent_homework_countDto,
  ): Promise<Student_homework_count> {
    const { homeworkId, studentId, ...rest } = createStudent_homework_countDto;

    const homeWork = await this.homeWorkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });

    if (!homeWork) {
      throw new NotFoundException(`Homework with ID ${homeworkId} not found`);
    }
    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDelete: false },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    // Tạo class và gán teacher
    const student_homework_countEntity =
      this.student_homework_countRepository.create({
        ...rest,
        homework: homeWork,
        student: student,
      });

    return await this.student_homework_countRepository.save(
      student_homework_countEntity,
    );
  }

  async update(
    id: number,
    updateStudent_homework_countDto: UpdateStudent_homework_countDto,
  ): Promise<Student_homework_count> {
    const { homeworkId, studentId, ...rest } = updateStudent_homework_countDto;
    const student_homework_countEntity = await this.findOne(id);
    if (!student_homework_countEntity) {
      throw new NotFoundException(
        `student_homework_count with ID ${id} not found`,
      );
    }
    if (homeworkId !== undefined) {
      const homeWork = await this.homeWorkRepository.findOne({
        where: { id: homeworkId, isDelete: false },
      });

      if (!homeWork) {
        throw new NotFoundException(`Homework with ID ${homeworkId} not found`);
      }
      student_homework_countEntity.homework = homeWork;
    }
    if (studentId !== undefined) {
      const student = await this.studentRepository.findOne({
        where: { id: studentId, isDelete: false },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
      student_homework_countEntity.student = student;
    }
    Object.assign(student_homework_countEntity, rest);

    return await this.student_homework_countRepository.save(
      student_homework_countEntity,
    );
  }
  async updateCount(
    updateCountDto: UpdateCountDto,
  ): Promise<Student_homework_count> {
    const { homeworkId, studentId, ...rest } = updateCountDto;
    let homework = null;
    if (homeworkId !== undefined) {
      homework = await this.homeWorkRepository.findOne({
        where: { id: homeworkId, isDelete: false },
      });

      if (!homework) {
        throw new NotFoundException(`homework with ID ${homeworkId} not found`);
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
    let student_homework_countEntity =
      await this.student_homework_countRepository.findOne({
        where: { student, homework, isDelete: false },
      });
    if (!student_homework_countEntity) {
      student_homework_countEntity =
        this.student_homework_countRepository.create({
          ...rest,
          count: 1,
          homework: homework,
          student: student,
        });
      return await this.student_homework_countRepository.save(
        student_homework_countEntity,
      );
    } else {
      student_homework_countEntity.count++;
      return await this.student_homework_countRepository.save(
        student_homework_countEntity,
      );
    }
  }
  async getAllCountOfClass(
    allStudentOfClassDto: AllStudentOfClassDto,
  ): Promise<Student_homework_count[]> {
    const student_homework_count = await Promise.all(
      allStudentOfClassDto.students.map(async (std) => {
        const student = await this.studentRepository.findOne({
          where: { id: std.studentId },
        });
        return await this.student_homework_countRepository.find({
          select: { id: true, count: true },
          where: { student, isDelete: false },
          relations: ['student', 'homework'],
        });
      }),
    );
    return student_homework_count.flat();
  }
  async remove(id: number): Promise<void> {
    // const result = await this.homeWorkRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`HomeWork with ID ${id} not found`);
    // }
    const student_homework_countEntity =
      await this.student_homework_countRepository.findOne({
        where: { id, isDelete: false },
      });
    if (!student_homework_countEntity) {
      throw new NotFoundException(
        `student_homework_count with ID ${id} not found`,
      );
    }
    student_homework_countEntity.isDelete = true;
    await this.homeWorkRepository.save(student_homework_countEntity);
  }
}
