import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { TestService } from './test.service';
import { TestEntity } from './test.entity';
import { CreateTestDto } from './test.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(@Body() createTestDto: CreateTestDto): Promise<TestEntity> {
    return this.testService.create(createTestDto);
  }

  @Get()
  async findAll(): Promise<TestEntity[]> {
    return this.testService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<TestEntity> {
    return this.testService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTestDto: CreateTestDto,
  ): Promise<TestEntity> {
    return this.testService.update(id, updateTestDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.testService.remove(id);
  }
}
