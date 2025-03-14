import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';
import { Class } from 'src/class/class.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({ where: { isDelete: false } });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  // async create(createStudentDto: CreateStudentDto): Promise<Student> {
  //   const student = this.studentRepository.create(createStudentDto);
  //   return await this.studentRepository.save(student);
  // }

  // async update(
  //   id: number,
  //   updateStudentDto: UpdateStudentDto,
  // ): Promise<Student> {
  //   const student = await this.findOne(id);
  //   Object.assign(student, updateStudentDto);
  //   return await this.studentRepository.save(student);
  // }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { classID, ...rest } = createStudentDto;
    const student = this.studentRepository.create(rest);

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }
      student.class = classEntity;
    }

    return await this.studentRepository.save(student);
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const { classID, ...rest } = updateStudentDto;
    const student = await this.findOne(id);

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }
      student.class = classEntity;
    }

    Object.assign(student, rest);
    return await this.studentRepository.save(student);
  }

  async findByClass(classID: number): Promise<Student[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classID, isDelete: false },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classID} not found`);
    }

    return await this.studentRepository.find({
      where: { class: classEntity, isDelete: false },
    });
  }

  async remove(id: number): Promise<void> {
    // const result = await this.studentRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Student with ID ${id} not found`);
    // }
    const Student = await this.studentRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    Student.isDelete = true;
    await this.studentRepository.save(Student);
  }
}
