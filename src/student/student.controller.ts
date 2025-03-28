import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';
import { Student } from './student.entity';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAll(): Promise<Student[]> {
    return await this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return await this.studentService.findOne(id);
  }
  @Get('classCount/:classId')
  async countAllStudentOfClass(
    @Param('classId', ParseIntPipe) classId: number,
  ): Promise<number> {
    return await this.studentService.countAllStudentOfClass(classId);
  }
  @Get('class/:classID')
  async findByClass(
    @Param('classID', ParseIntPipe) classID: number,
  ): Promise<Student[]> {
    return await this.studentService.findByClass(classID);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Student> {
    return await this.studentService.create(createStudentDto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Student> {
    return await this.studentService.update(id, updateStudentDto, file);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.studentService.remove(id);
  }
}
