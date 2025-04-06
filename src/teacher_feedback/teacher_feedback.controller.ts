import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TeacherFeedbackService } from './teacher_feedback.service';
import {
  CreateTeacherFeedbackDto,
  UpdateTeacherFeedbackDto,
} from './teacher_feedback.dto';

@Controller('teacher-feedback')
export class TeacherFeedbackController {
  constructor(
    private readonly teacherFeedbackService: TeacherFeedbackService,
  ) {}

  @Post()
  createFeedback(@Body() dto: CreateTeacherFeedbackDto) {
    return this.teacherFeedbackService.createFeedback(dto);
  }

  @Get()
  getAllFeedbacks() {
    return this.teacherFeedbackService.getAllFeedbacks();
  }

  @Get('teacher/:teacherID')
  findFeedbackByTeacherID(@Param('teacherID') teacherID: number) {
    return this.teacherFeedbackService.findFeedbackByTeacherID(teacherID);
  }

  @Get(':id')
  getFeedbackById(@Param('id') id: number) {
    return this.teacherFeedbackService.getFeedbackById(id);
  }

  @Put(':id')
  updateFeedback(
    @Param('id') id: number,
    @Body() dto: UpdateTeacherFeedbackDto,
  ) {
    return this.teacherFeedbackService.updateFeedback(id, dto);
  }

  @Delete(':id')
  deleteFeedback(@Param('id') id: number) {
    return this.teacherFeedbackService.deleteFeedback(id);
  }
}
