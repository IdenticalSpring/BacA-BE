import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lesson.entity';
import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async findAll(): Promise<Lesson[]> {
    return await this.lessonRepository.find({ where: { isDelete: false } });
  }
  async findLessonByLevel(level: string): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { level, isDelete: false },
    });
  }
  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.lessonRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Lesson with ID ${id} not found`);
    // }
    const Lesson = await this.lessonRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    Lesson.isDelete = true;
    await this.lessonRepository.save(Lesson);
  }
}
