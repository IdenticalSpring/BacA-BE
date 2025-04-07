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
import { TeacherCommentOnStudentService } from './teachercommentonstudent.service';
import {
  CreateTeacherCommentOnStudentDto,
  UpdateTeacherCommentOnStudentDto,
} from './teachercommentonstudent.dto';
import { TeacherCommentOnStudent } from './teachercommentonstudent.entity';

@Controller('teacher-comments')
export class TeacherCommentOnStudentController {
  constructor(private readonly service: TeacherCommentOnStudentService) {}

  @Get()
  async findAll(): Promise<TeacherCommentOnStudent[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TeacherCommentOnStudent> {
    return await this.service.findOne(id);
  }

  @Get('student/:studentID')
  async getEvaluationByStudentID(
    @Param('studentID', ParseIntPipe) studentID: number,
  ): Promise<TeacherCommentOnStudent[]> {
    return await this.service.getEvaluationByStudentID(studentID);
  }

  @Post()
  async create(
    @Body() createDto: CreateTeacherCommentOnStudentDto,
  ): Promise<TeacherCommentOnStudent> {
    return await this.service.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTeacherCommentOnStudentDto,
  ): Promise<TeacherCommentOnStudent> {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.service.remove(id);
  }
}
