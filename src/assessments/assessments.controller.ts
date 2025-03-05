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
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentsDto, UpdateAssessmentsDto } from './assessments.dto';
import { Assessments } from './assessments.entity';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  async findAll(): Promise<Assessments[]> {
    return await this.assessmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Assessments> {
    return await this.assessmentsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createAssessmentsDto: CreateAssessmentsDto,
  ): Promise<Assessments> {
    return await this.assessmentsService.create(createAssessmentsDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssessmentsDto: UpdateAssessmentsDto,
  ): Promise<Assessments> {
    return await this.assessmentsService.update(id, updateAssessmentsDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.assessmentsService.remove(id);
  }
}
