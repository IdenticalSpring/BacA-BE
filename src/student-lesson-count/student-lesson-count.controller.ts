import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Student_lesson_countService } from './student-lesson-count.service';
import {
  AllStudentOfClassDto,
  CreateStudent_lesson_countDto,
  UpdateCountDto,
  UpdateStudent_lesson_countDto,
} from './student-lesson-count.dto';
import { Student_lesson_count } from './student-lesson-count.entity';
@Controller('student_lesson_count')
export class Student_lesson_countController {
  constructor(
    private readonly student_lesson_countService: Student_lesson_countService,
  ) {}

  @Get()
  async findAll(): Promise<Student_lesson_count[]> {
    return await this.student_lesson_countService.findAll();
  }
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Student_lesson_count> {
    return await this.student_lesson_countService.findOne(id);
  }

  @Post()
  async create(
    @Body() createStudent_lesson_countDto: CreateStudent_lesson_countDto,
  ): Promise<Student_lesson_count> {
    return await this.student_lesson_countService.create(
      createStudent_lesson_countDto,
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudent_lesson_countDto: UpdateStudent_lesson_countDto,
  ): Promise<Student_lesson_count> {
    return await this.student_lesson_countService.update(
      id,
      updateStudent_lesson_countDto,
    );
  }
  @Patch()
  async updateCount(
    @Body() updateCountDto: UpdateCountDto,
  ): Promise<Student_lesson_count> {
    return await this.student_lesson_countService.updateCount(updateCountDto);
  }
  @Post('getAllCounts')
  async getAllCount(
    @Body() allStudentOfClassDto: AllStudentOfClassDto,
  ): Promise<Student_lesson_count[]> {
    return await this.student_lesson_countService.getAllCountOfClass(
      allStudentOfClassDto,
    );
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.student_lesson_countService.remove(id);
  }
}
