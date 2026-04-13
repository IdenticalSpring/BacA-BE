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
import { Roles } from 'src/auth/roles.decorator';

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
  @Get('access/:accessId')
  async findOneByAccessId(@Param('accessId') accessId: string): Promise<Class> {
    return await this.classService.findOneByAccessId(accessId);
  }

  @Get('teacher/:teacherID')
  async findByTeacher(
    @Param('teacherID', ParseIntPipe) teacherID: number,
  ): Promise<Class[]> {
    return await this.classService.findByTeacher(teacherID);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin', 'teacher')
  async create(@Body() createClassDto: CreateClassDto): Promise<Class> {
    console.log('createClassDto', createClassDto);
    return await this.classService.create(createClassDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return await this.classService.update(id, updateClassDto);
  }

  // Lock class with a 4-digit PIN
  @Put('lock/:id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'teacher')
  async lockClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { classPin: string },
  ): Promise<{ message: string }> {
    return await this.classService.lockClass(id, body.classPin);
  }

  // Unlock class (remove PIN)
  @Put('unlock/:id')
  @UseGuards(AuthGuard)
  @Roles('admin', 'teacher')
  async unlockClass(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.classService.unlockClass(id);
  }

  // Verify PIN for student access
  @Post('verify-pin/:id')
  async verifyPin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { classPin: string },
  ): Promise<{ success: boolean; message: string }> {
    return await this.classService.verifyPin(id, body.classPin);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.classService.remove(id);
  }
}

