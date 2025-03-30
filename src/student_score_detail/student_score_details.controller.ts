import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { StudentScoreDetailsService } from './student_score_details.service';
import {
  CreateStudentScoreDetailsDto,
  UpdateStudentScoreDetailsDto,
} from './student_score_details.dto';
import { StudentScoreDetails } from './student_score_details.entity';

@Controller('student-score-details')
export class StudentScoreDetailsController {
  constructor(private readonly service: StudentScoreDetailsService) {}

  @Get()
  async findAll(): Promise<StudentScoreDetails[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<StudentScoreDetails> {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateStudentScoreDetailsDto,
  ): Promise<StudentScoreDetails> {
    return this.service.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateStudentScoreDetailsDto,
  ): Promise<StudentScoreDetails> {
    return this.service.update(id, updateDto);
  }
  @Get('student/:studentId')
  async getScoreDetailsByStudentId(
    @Param('studentId') studentId: number,
  ): Promise<StudentScoreDetails[]> {
    return this.service.getScoreDetailsByStudentId(studentId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
