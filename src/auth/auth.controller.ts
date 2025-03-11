import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateAdminDto } from 'src/admin/admin.dto';
import { TeacherLoginDto } from 'src/teacher/teacherlogin.dto';
import { StudentLoginDto } from 'src/student/studentLogin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.authService.registerUser(body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    const token = await this.authService.generateToken(user);
    return { token };
  }
  @Post('admin/login')
  async adminLogin(@Body() body: CreateAdminDto) {
    const admin = await this.authService.validateAdmin(
      body.username,
      body.password,
    );
    const token = await this.authService.generateToken(admin);
    return { token };
  }
  @Post('teacher/login')
  async teacherLogin(@Body() body: TeacherLoginDto) {
    const teacher = await this.authService.validateTeacher(
      body.username,
      body.password,
    );
    const token = await this.authService.generateToken(teacher);
    return { token };
  }

  @Post('student/login')
  async studentLogin(@Body() body: StudentLoginDto) {
    const student = await this.authService.validateStudent(
      body.username,
      body.password,
    );
    const token = await this.authService.generateToken(student);
    return { token };
  }

  @Post('protected')
  @UseGuards(AuthGuard('jwt'))
  getProtectedData(@Req() req: Request) {
    console.log('🔍 Token Decoded User:', req.user); // Debug log

    if (!req.user) {
      return { message: 'No user found in request!' };
    }

    return { message: 'You have accessed a protected route', user: req.user };
  }
}
