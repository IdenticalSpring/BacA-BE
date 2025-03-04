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
import { TestTypeService } from './testtype.service';
import { CreateTestTypeDto, UpdateTestTypeDto } from './testtype.dto';
import { TestType } from './testtype.entity';

@Controller('testtypes')
export class TestTypeController {
  constructor(private readonly testTypeService: TestTypeService) {}

  @Get()
  async findAll(): Promise<TestType[]> {
    return await this.testTypeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TestType> {
    return await this.testTypeService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateTestTypeDto): Promise<TestType> {
    return await this.testTypeService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTestTypeDto,
  ): Promise<TestType> {
    return await this.testTypeService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.testTypeService.remove(id);
  }
}
