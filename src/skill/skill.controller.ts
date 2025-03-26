import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto, UpdateSkillDto } from './skill.dto';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  async findAll() {
    return await this.skillService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.skillService.findOne(id);
  }

  @Post()
  async create(@Body() createSkillDto: CreateSkillDto) {
    return await this.skillService.create(createSkillDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return await this.skillService.update(id, updateSkillDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.skillService.remove(id);
  }
}
