import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { StudentQuestionAnswerService } from './studenQuestionAnser.service';
import {
  CreateStudentQuestionAnswerDto,
  UpdateStudentQuestionAnswerDto,
} from './studenQuestionAnser.dto';

@Controller('student-question-answers')
export class StudentQuestionAnswerController {
  constructor(private readonly service: StudentQuestionAnswerService) {}

  @Post()
  create(@Body() dto: CreateStudentQuestionAnswerDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-homework/:homeWorkId')
  findByHomeWork(@Param('homeWorkId') homeWorkId: string) {
    return this.service.findByHomeWorkId(Number(homeWorkId));
  }

  @Get('by-question/:questionId/student/:studentId')
  findByQuestionAndStudent(
    @Param('questionId') questionId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.service.findByQuestionAndStudent(
      Number(questionId),
      Number(studentId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentQuestionAnswerDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
