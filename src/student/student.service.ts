import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';
import { Class } from 'src/class/class.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { isDelete: false },
      relations: ['class', 'testResults', 'schedule', 'checkins'],
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id, isDelete: false },
      relations: ['class', 'testResults', 'schedule', 'checkins'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }
  async countAllStudentOfClass(classId: number): Promise<number> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId, isDelete: false },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    const students = await this.studentRepository.find({
      where: { class: classEntity, isDelete: false },
    });
    // if (students?.length <= 0) {
    //   throw new NotFoundException(`Students with classID ${classId} not found`);
    // }
    return students?.length;
  }
  async create(
    createStudentDto: CreateStudentDto,
    file: Express.Multer.File,
  ): Promise<Student> {
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

    if (file) {
      const imgUrl = await CloudinaryService.uploadBuffer(file.buffer);
      student.imgUrl = imgUrl;
    }

    return await this.studentRepository.save(student);
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    file: Express.Multer.File,
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

    if (file) {
      const imgUrl = await CloudinaryService.uploadBuffer(file.buffer);
      student.imgUrl = imgUrl;
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
      relations: ['class', 'testResults', 'schedule', 'checkins'],
    });
  }

  async remove(id: number): Promise<void> {
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
