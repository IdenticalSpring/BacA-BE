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
  UploadedFiles,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { Vocabulary } from './vocabulary.entity';
import { CreateVocabularyDto, UpdateVocabularyDto } from './vocabulary.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async findAll(): Promise<Vocabulary[]> {
    return await this.vocabularyService.findAll();
  }
  @Get('homework/:homeworkId')
  async findVocabularyByHomeworkId(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
  ): Promise<Vocabulary[]> {
    return await this.vocabularyService.findVocabularyByHomeworkId(homeworkId);
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Vocabulary> {
    return await this.vocabularyService.findOne(id);
  }
  @Get('student')
  async findAllForStudent(): Promise<Vocabulary[]> {
    return await this.vocabularyService.findAllForStudent();
  }
  @Get('student/homework/:homeworkId')
  async findVocabularyByHomeworkIdForStudent(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
  ): Promise<Vocabulary[]> {
    return await this.vocabularyService.findVocabularyByHomeworkIdForStudent(
      homeworkId,
    );
  }
  @Get('student/:id')
  async findOneForStudent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Vocabulary> {
    return await this.vocabularyService.findOneForStudent(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('mp3File'))
  async create(
    @Body() createVocabularyDto: CreateVocabularyDto,
    @UploadedFile() mp3File: Express.Multer.File,
  ): Promise<Vocabulary> {
    return await this.vocabularyService.create(createVocabularyDto, mp3File);
  }
  @Post('bulk-create')
  @UseInterceptors(AnyFilesInterceptor())
  async bulkCreate(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Vocabulary[]> {
    const vocabularies = JSON.parse(body.vocabularies);
    return await this.vocabularyService.bulkCreateWithFiles(
      vocabularies,
      files,
    );
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('mp3File'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
    @UploadedFile() mp3File: Express.Multer.File,
  ): Promise<Vocabulary> {
    return await this.vocabularyService.update(
      id,
      updateVocabularyDto,
      mp3File,
    );
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.vocabularyService.remove(id);
  }
}
