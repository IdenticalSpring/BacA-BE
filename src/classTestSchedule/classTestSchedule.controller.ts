import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ClassTestScheduleService } from './classTestSchedule.service';
import { CreateClassTestScheduleDto } from './classTestSchedule.dto';
import { ClassTestScheduleEntity } from './classTestSchedule.entity';

@Controller('classTestSchedule')
export class ClassTestScheduleController {
  constructor(
    private readonly classTestScheduleService: ClassTestScheduleService,
  ) {}

  @Post()
  async create(
    @Body() createClassTestScheduleDto: CreateClassTestScheduleDto,
  ): Promise<ClassTestScheduleEntity> {
    return this.classTestScheduleService.create(createClassTestScheduleDto);
  }

  @Get()
  async findAll(): Promise<ClassTestScheduleEntity[]> {
    return this.classTestScheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ClassTestScheduleEntity> {
    return this.classTestScheduleService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateClassTestScheduleDto: CreateClassTestScheduleDto,
  ): Promise<ClassTestScheduleEntity> {
    return this.classTestScheduleService.update(id, updateClassTestScheduleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.classTestScheduleService.remove(id);
  }
}
