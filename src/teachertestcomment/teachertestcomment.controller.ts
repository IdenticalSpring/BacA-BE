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
import { TeacherTestCommentService } from './teachertestcomment.service';
import {
  CreateTeacherTestCommentDto,
  UpdateTeacherTestCommentDto,
} from './teachertestcomment.dto';
import { TeacherTestComment } from './teachertestcomment.entity';

@Controller('teacher-test-comments')
export class TeacherTestCommentController {
  constructor(private readonly service: TeacherTestCommentService) {}

  @Get()
  async findAll(): Promise<TeacherTestComment[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TeacherTestComment> {
    return await this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateTeacherTestCommentDto,
  ): Promise<TeacherTestComment> {
    return await this.service.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTeacherTestCommentDto,
  ): Promise<TeacherTestComment> {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.service.remove(id);
  }
}
