import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';
import { Class } from 'src/class/class.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/notification.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private jwtService: JwtService,
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
  async findOneAndLogin(studentId: number): Promise<string> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDelete: false },
    });
    return this.jwtService.sign({
      userId: student.id,
      username: student.username,
      role: 'student',
    });
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

  async removeClassFromStudent(id: number): Promise<Student> {
    const student = await this.findOne(id);
    student.class = null;
    return await this.studentRepository.save(student);
  }

  async requestDeleteStudent(id: number): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['class'], // Đảm bảo tải quan hệ class
    });
    if (!student) {
      throw new NotFoundException(`Học sinh với ID ${id} không tồn tại`);
    }

    // Lấy tên học sinh và tên lớp
    const studentName = student.name || `Học sinh ID ${id}`; // Thay 'name' bằng thuộc tính thực tế
    const className = student.class ? student.class.name : 'Không có lớp'; // Thay 'name' bằng thuộc tính thực tế của Class

    const createNotificationDto: CreateNotificationDto = {
      title: `Yêu cầu xóa học sinh ${studentName} lớp ${className}`,
      detail: `Giáo viên yêu cầu xóa học sinh ${studentName} lớp ${className}.`,
      general: false,
      type: true,
      isDelete: false,
      classID: student.class ? student.class.id : undefined,
    };

    const notification = await this.notificationService.create(
      createNotificationDto,
    );
    return {
      message: `Yêu cầu xóa học sinh ${studentName} đã được gửi đến admin`,
      notification,
    };
  }
}
