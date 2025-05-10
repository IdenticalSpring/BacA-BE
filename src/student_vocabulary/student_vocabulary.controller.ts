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
import { Student_vocabularyService } from './student_vocabulary.service';
import { Student_vocabulary } from './student_vocabulary.entity';
import {
  CreateStudentVocabularyDto,
  findAllStudentVocabulariesByHomeworkIdAndStudentIdDto,
  UpdateStudentVocabularyDto,
} from './student_vocabulary.dto';
@Controller('student_vocabulary')
export class Student_vocabularyController {
  constructor(
    private readonly student_vocabularyService: Student_vocabularyService,
  ) {}

  @Get()
  async findAll(): Promise<Student_vocabulary[]> {
    return await this.student_vocabularyService.findAll();
  }
  @Post('homework')
  async findAllStudentVocabulariesByHomeworkId(
    @Body()
    findAllStudentVocabulariesByHomeworkIdAndStudentId: findAllStudentVocabulariesByHomeworkIdAndStudentIdDto,
  ): Promise<Student_vocabulary[]> {
    return await this.student_vocabularyService.findAllStudentVocabulariesByHomeworkIdAndStudentId(
      findAllStudentVocabulariesByHomeworkIdAndStudentId,
    );
  }
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Student_vocabulary> {
    return await this.student_vocabularyService.findOne(id);
  }
  @Post()
  async create(
    @Body() createStudentVocabularyDto: CreateStudentVocabularyDto,
  ): Promise<Student_vocabulary> {
    return await this.student_vocabularyService.create(
      createStudentVocabularyDto,
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentVocabularyDto: UpdateStudentVocabularyDto,
  ): Promise<Student_vocabulary> {
    return await this.student_vocabularyService.update(
      id,
      updateStudentVocabularyDto,
    );
  }
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.student_vocabularyService.remove(id);
  }
}
