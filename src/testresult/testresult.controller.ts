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
import { TestResultService } from './testresult.service';
import { CreateTestResultDto, UpdateTestResultDto } from './testresult.dto';
import { TestResult } from './testresult.entity';

@Controller('testresults')
export class TestResultController {
  constructor(private readonly testResultService: TestResultService) {}

  @Get()
  async findAll(): Promise<TestResult[]> {
    return await this.testResultService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TestResult> {
    return await this.testResultService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateTestResultDto): Promise<TestResult> {
    return await this.testResultService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTestResultDto,
  ): Promise<TestResult> {
    return await this.testResultService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.testResultService.remove(id);
  }
}
