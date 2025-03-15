import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Get('class/:classID')
  async findByClass(
    @Param('classID', ParseIntPipe) classID: number,
  ): Promise<Student[]> {
    return await this.studentService.findByClass(classID);
  }

  // @Post()
  // async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
  //   return await this.studentService.create(createStudentDto);
  // }

  // @Put(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateStudentDto: UpdateStudentDto,
  // ): Promise<Student> {
  //   return await this.studentService.update(id, updateStudentDto);
  // }
  @Post()
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return await this.studentService.create(createStudentDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return await this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.studentService.remove(id);
  }
}
