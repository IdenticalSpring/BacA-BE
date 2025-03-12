import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { Admin } from 'src/admin/admin.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { Student } from 'src/student/student.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student) private studentRepository: Repository<Student>,

    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new BadRequestException('Password cannot be empty');
    }
    return bcrypt.hash(password, 10);
  }

  async registerUser(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    return { message: 'User registered successfully', username: user.username };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    return { userId: user.id, username: user.username, role: 'user' };
  }

  async validateAdmin(username: string, password: string): Promise<any> {
    console.log(`Validating admin: ${username}`); // Add logging

    const admin = await this.adminRepository.findOne({
      where: { username },
    });

    if (!admin) {
      throw new BadRequestException('Invalid credentials');
    }

    // So sánh mật khẩu trực tiếp mà không cần mã hóa
    if (password !== admin.password) {
      throw new BadRequestException('Invalid credentials');
    }
    // console.log('JWT_SECRET:', process.env.JWT_SECRET);
    return { userId: admin.id, username: admin.username, role: 'admin' };
  }
  async validateTeacher(username: string, password: string): Promise<any> {
    const teacher = await this.teacherRepository.findOne({
      where: { username },
    });

    if (!teacher) {
      throw new BadRequestException('Invalid credentials');
    }

    if (password !== teacher.password) {
      throw new BadRequestException('Invalid credentials');
    }

    return { userId: teacher.id, username: teacher.username, role: 'teacher' };
  }

  async validateStudent(username: string, password: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { username },
    });

    if (!student) {
      throw new BadRequestException('Invalid credentials');
    }

    if (password !== student.password) {
      throw new BadRequestException('Invalid credentials');
    }

    return { userId: student.id, username: student.username, role: 'student' };
  }

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
