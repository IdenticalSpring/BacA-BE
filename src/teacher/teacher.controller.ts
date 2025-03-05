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
import { TeacherService } from './teacher.service';
import { CreateTeacherDto, UpdateTeacherDto } from './teacher.dto';
import { Teacher } from './teacher.entity';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  async findAll(): Promise<Teacher[]> {
    return await this.teacherService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Teacher> {
    return await this.teacherService.findOne(id);
  }

  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return await this.teacherService.create(createTeacherDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return await this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.teacherService.remove(id);
  }
}
