import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto } from './class.dto';
import { Class } from './class.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  async findAll(): Promise<Class[]> {
    return await this.classService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Class> {
    return await this.classService.findOne(id);
  }

  @Get('teacher/:teacherID')
  async findByTeacher(
    @Param('teacherID', ParseIntPipe) teacherID: number,
  ): Promise<Class[]> {
    return await this.classService.findByTeacher(teacherID);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createClassDto: CreateClassDto): Promise<Class> {
    console.log('createClassDto', createClassDto);
    return await this.classService.create(createClassDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return await this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.classService.remove(id);
  }
}
