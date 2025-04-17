import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { StudentSkillBehaviorScoreService } from './studentskillbehaviorscore.service';
import {
  CreateStudentSkillBehaviorScoreDto,
  UpdateStudentSkillBehaviorScoreDto,
} from './studentskillbehaviorscore.dto';
import { StudentSkillBehaviorScore } from './studentskillbehaviorscore.entity';

@Controller('studentskillbehaviorscores')
export class StudentSkillBehaviorScoreController {
  constructor(private readonly service: StudentSkillBehaviorScoreService) {}

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateStudentSkillBehaviorScoreDto) {
    return await this.service.create(dto);
  }

  @Get('student/:studentID')
  async getEvaluationSkillStudent(@Param('studentID') studentId: number) {
    return await this.service.getEvaluationSkillStudent(studentId);
  }

  @Get('date/:date')
  async getScoresByDate(@Param('date') date: string) {
    return await this.service.getScoresByDate(date);
  }

  @Put('date/:date')
  async updateScoresByDate(
    @Param('date') date: string,
    @Body() updateData: Partial<StudentSkillBehaviorScore>,
  ) {
    return await this.service.updateScoresByDate(date, updateData);
  }

  @Put('student/:studentID/date/:date')
  async updateScoreByStudentAndDate(
    @Param('studentID') studentID: number,
    @Param('date') date: string,
    @Body() updateData: Partial<StudentSkillBehaviorScore>,
  ) {
    return await this.service.updateScoreByStudentAndDate(
      studentID,
      date,
      updateData,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateStudentSkillBehaviorScoreDto,
  ) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.service.remove(id);
  }
}
