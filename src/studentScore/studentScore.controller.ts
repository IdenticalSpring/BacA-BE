import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { StudentScoreService } from './studentScore.service';
import { CreateStudentScoreDto } from './studentScore.dto';
import { StudentScoreEntity } from './studentScore.entity';

@Controller('studentScore')
export class StudentScoreController {
  constructor(private readonly studentScoreService: StudentScoreService) {}

  @Post()
  async create(
    @Body() createStudentScoreDto: CreateStudentScoreDto,
  ): Promise<StudentScoreEntity> {
    return this.studentScoreService.create(createStudentScoreDto);
  }

  @Get()
  async findAll(): Promise<StudentScoreEntity[]> {
    return this.studentScoreService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<StudentScoreEntity> {
    return this.studentScoreService.findOne(id);
  }

  @Get('student/:studentID')
  async findByStudentId(
    @Param('studentID') studentID: number,
  ): Promise<StudentScoreEntity[]> {
    return this.studentScoreService.findByStudentId(studentID);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStudentScoreDto: CreateStudentScoreDto,
  ): Promise<StudentScoreEntity> {
    return this.studentScoreService.update(id, updateStudentScoreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.studentScoreService.remove(id);
  }
}
