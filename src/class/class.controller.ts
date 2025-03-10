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
  @UseGuards(AuthGuard)
  async findAll(): Promise<Class[]> {
    return await this.classService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Class> {
    return await this.classService.findOne(id);
  }

  @Post()
  async create(@Body() createClassDto: CreateClassDto): Promise<Class> {
    console.log('createClassDto', createClassDto);
    return await this.classService.create(createClassDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return await this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.classService.remove(id);
  }
}
