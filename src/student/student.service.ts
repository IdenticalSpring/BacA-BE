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
  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { classID, ...rest } = createStudentDto;

    // Check username đã tồn tại chưa
    const existingUsername = await this.studentRepository.findOne({
      where: { username: createStudentDto.username },
    });
    if (existingUsername) {
      throw new NotFoundException(
        `Username '${createStudentDto.username}' already exists. Please use a different username.`,
      );
    }

    // Check trùng lặp name + classID
    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }

      // Kiểm tra xem đã có học sinh cùng tên trong lớp chưa
      const duplicateStudent = await this.studentRepository.findOne({
        where: {
          name: createStudentDto.name,
          class: classEntity,
          isDelete: false,
        },
      });

      if (duplicateStudent) {
        throw new NotFoundException(
          `Student '${createStudentDto.name}' already exists in this class. Please check again.`,
        );
      }

      const student = this.studentRepository.create(rest);
      student.class = classEntity;
      return await this.studentRepository.save(student);
    }

    const student = this.studentRepository.create(rest);
    return await this.studentRepository.save(student);
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const { classID, ...rest } = updateStudentDto;
    const student = await this.findOne(id);
    const oldPassword = student.password;

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }
      student.class = classEntity;
    }

    // Đã xóa logic upload file và Cloudinary

    Object.assign(student, rest);

    // Kiểm tra xem mật khẩu gửi lên có thực sự thay đổi so với mật khẩu cũ không
    if (rest.password !== undefined) {
      if (rest.password.trim() !== '' && rest.password !== oldPassword) {
        student.hasCustomPassword = true;
      } else if (rest.password.trim() === '') {
        // Nếu frontend gửi lên chuỗi rỗng do không nhập password mới,
        // giữ nguyên lại mật khẩu cũ đã bị Object.assign đè lên
        student.password = oldPassword;
      }
    }

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

  // async remove(id: number): Promise<void> {
  //   const Student = await this.studentRepository.findOne({
  //     where: { id, isDelete: false },
  //   });
  //   if (!Student) {
  //     throw new NotFoundException(`Student with ID ${id} not found`);
  //   }
  //   Student.isDelete = true;
  //   await this.studentRepository.save(Student);
  // }

  async remove(id: number): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    await this.studentRepository.remove(student);
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

  // Đổi mật khẩu cho học sinh - bật cờ hasCustomPassword
  async changePassword(
    id: number,
    newPassword: string,
  ): Promise<{ message: string }> {
    const student = await this.findOne(id);

    if (!newPassword || newPassword.trim() === '') {
      throw new NotFoundException('Mật khẩu mới không được để trống');
    }

    student.password = newPassword;
    student.hasCustomPassword = true;
    await this.studentRepository.save(student);

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Tìm tất cả học sinh trùng lặp (chỉ để xem, KHÔNG xóa)
  async findDuplicateStudents(): Promise<any[]> {
    const query = `
      SELECT 
        s1.name, 
        s1.classID,
        c.name as className,
        GROUP_CONCAT(s1.id ORDER BY s1.id) as studentIds,
        COUNT(*) as duplicateCount
      FROM student s1
      LEFT JOIN class c ON s1.classID = c.id
      WHERE s1.isDelete = false
      GROUP BY s1.name, s1.classID
      HAVING COUNT(*) > 1
      ORDER BY duplicateCount DESC, s1.name
    `;

    const duplicates = await this.studentRepository.query(query);
    return duplicates;
  }
}
