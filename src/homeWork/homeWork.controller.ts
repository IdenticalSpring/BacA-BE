import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeWorkService } from './homeWork.service';
import {
  CreateHomeWorkDto,
  findHomeWorkByLevelAndTeacherIdDto,
  textToSpeechDto,
  UpdateHomeWorkDto,
} from './homeWork.dto';
import { HomeWork } from './homeWork.entity';
import { get } from 'http';
@Controller('homeworks')
export class HomeWorkController {
  constructor(private readonly homeworkService: HomeWorkService) {}

  @Get()
  async findAll(): Promise<HomeWork[]> {
    return await this.homeworkService.findAll();
  }
  @Post('level')
  async findHomeWorkByLevelAndTeacherId(
    @Body() findHomeWorkByLevelAndTeacherId: findHomeWorkByLevelAndTeacherIdDto,
  ): Promise<HomeWork[]> {
    return await this.homeworkService.findHomeWorkByLevelAndTeacherId(
      findHomeWorkByLevelAndTeacherId,
    );
  }
  @Get('teacher/:teacherId')
  async findHomeWorkByTeacherId(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<HomeWork[]> {
    return await this.homeworkService.findHomeWorkByTeacherId(teacherId);
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<HomeWork> {
    return await this.homeworkService.findOne(id);
  }
  @UseInterceptors(FileInterceptor('mp3File'))
  @Post()
  async create(
    @Body() createHomeWorkDto: CreateHomeWorkDto,
  ): Promise<HomeWork> {
    return await this.homeworkService.create(createHomeWorkDto);
  }
  @UseInterceptors(FileInterceptor('mp3File'))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeWorkDto: UpdateHomeWorkDto,
  ): Promise<HomeWork> {
    return await this.homeworkService.update(id, updateHomeWorkDto);
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.homeworkService.remove(id);
  }
  @Post('/textToSpeech')
  async textToSpeech(@Body() textToSpeech: textToSpeechDto): Promise<string> {
    return await this.homeworkService.textToSpeech(textToSpeech);
  }
}
