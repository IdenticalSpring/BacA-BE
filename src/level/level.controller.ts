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
import { LevelService } from './level.service';
import { CreateLevelDto, UpdateLevelDto } from './level.dto';
import { Level } from './level.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  async findAll(): Promise<Level[]> {
    return await this.levelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Level> {
    return await this.levelService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createLevelDto: CreateLevelDto): Promise<Level> {
    // console.log('createClassDto', createLevelDto);
    return await this.levelService.create(createLevelDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto,
  ): Promise<Level> {
    return await this.levelService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.levelService.remove(id);
  }
}
