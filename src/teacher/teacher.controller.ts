import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('files')) // Đổi từ FileInterceptor sang FilesInterceptor
  async create(
    @Body() createTeacherDto: CreateTeacherDto,
    @UploadedFiles() files: Express.Multer.File[], // Đổi từ UploadedFile sang UploadedFiles
  ): Promise<Teacher> {
    return await this.teacherService.create(createTeacherDto, files);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files')) // Đổi từ FileInterceptor sang FilesInterceptor
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @UploadedFiles() files?: Express.Multer.File[], // Đổi từ UploadedFile sang UploadedFiles
  ): Promise<Teacher> {
    return await this.teacherService.update(id, updateTeacherDto, files);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.teacherService.remove(id);
  }
}
