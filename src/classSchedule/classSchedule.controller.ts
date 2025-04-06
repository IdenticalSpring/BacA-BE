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
import { ClassScheduleService } from './classSchedule.service';
import {
  CreateClassScheduleDto,
  UpdateClassScheduleDto,
} from './classSchedule.dto';
import { ClassSchedule } from './classSchedule.entity';

@Controller('class-schedules')
export class ClassScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @Get()
  async findAll(): Promise<ClassSchedule[]> {
    return await this.classScheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ClassSchedule> {
    return await this.classScheduleService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateClassScheduleDto,
  ): Promise<ClassSchedule> {
    return await this.classScheduleService.create(createDto);
  }
  @Post('many')
  async createMany(
    @Body() createDtos: CreateClassScheduleDto[],
  ): Promise<ClassSchedule[]> {
    return await this.classScheduleService.createMany(createDtos);
  }
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassScheduleDto,
  ): Promise<ClassSchedule> {
    return await this.classScheduleService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.classScheduleService.remove(id);
  }
}
