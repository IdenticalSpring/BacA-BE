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
import { Student_homework_countService } from './student_homework_count.service';
import {
  AllStudentOfClassDto,
  CreateStudent_homework_countDto,
  UpdateCountDto,
  UpdateStudent_homework_countDto,
} from './student_homework_count.dto';
import { Student_homework_count } from './student_homework_count.entity';
@Controller('student_homework_count')
export class Student_homework_countController {
  constructor(
    private readonly student_homework_countService: Student_homework_countService,
  ) {}

  @Get()
  async findAll(): Promise<Student_homework_count[]> {
    return await this.student_homework_countService.findAll();
  }
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Student_homework_count> {
    return await this.student_homework_countService.findOne(id);
  }

  @Post()
  async create(
    @Body() createStudent_homework_countDto: CreateStudent_homework_countDto,
  ): Promise<Student_homework_count> {
    return await this.student_homework_countService.create(
      createStudent_homework_countDto,
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudent_homework_countDto: UpdateStudent_homework_countDto,
  ): Promise<Student_homework_count> {
    return await this.student_homework_countService.update(
      id,
      updateStudent_homework_countDto,
    );
  }
  @Patch()
  async updateCount(
    @Body() updateCountDto: UpdateCountDto,
  ): Promise<Student_homework_count> {
    return await this.student_homework_countService.updateCount(updateCountDto);
  }
  @Post('getAllCounts')
  async getAllCount(
    @Body() allStudentOfClassDto: AllStudentOfClassDto,
  ): Promise<Student_homework_count[]> {
    return await this.student_homework_countService.getAllCountOfClass(
      allStudentOfClassDto,
    );
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.student_homework_countService.remove(id);
  }
}
