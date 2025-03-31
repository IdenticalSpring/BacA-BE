import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createTeacherDto: CreateTeacherDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Teacher> {
    return await this.teacherService.create(createTeacherDto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Teacher> {
    return await this.teacherService.update(id, updateTeacherDto, file);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.teacherService.remove(id);
  }
}
