import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSchedule } from './classSchedule.entity';
import {
  CreateClassScheduleDto,
  UpdateClassScheduleDto,
} from './classSchedule.dto';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Lesson } from '../lesson/lesson.entity';

@Injectable()
export class ClassScheduleService {
  constructor(
    @InjectRepository(ClassSchedule)
    private readonly classScheduleRepository: Repository<ClassSchedule>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async findAll(): Promise<ClassSchedule[]> {
    return await this.classScheduleRepository.find({
      where: { isDelete: false },
      relations: ['class', 'schedule', 'lesson'],
    });
  }

  async findOne(id: number): Promise<ClassSchedule> {
    return await this.classScheduleRepository.findOne({
      where: { id, isDelete: false },
      relations: ['class', 'schedule', 'lesson'],
    });
  }

  async create(createDto: CreateClassScheduleDto): Promise<ClassSchedule> {
    const classEntity = await this.classRepository.findOne({
      where: { id: createDto.classID, isDelete: false },
    });
    if (!classEntity) {
      throw new Error('Class not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      where: { id: createDto.scheduleID, isDelete: false },
    });
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: createDto.lessonID, isDelete: false },
    });
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Tạo entity hợp lệ
    const classSchedule = this.classScheduleRepository.create({
      class: classEntity,
      schedule: schedule,
      lesson: lesson,
    });

    return await this.classScheduleRepository.save(classSchedule);
  }

  async update(
    id: number,
    updateDto: UpdateClassScheduleDto,
  ): Promise<ClassSchedule> {
    const classSchedule = await this.classScheduleRepository.findOne({
      where: { id, isDelete: false },
    });

    if (!classSchedule) {
      throw new Error('ClassSchedule not found');
    }

    if (updateDto.classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateDto.classID, isDelete: false },
      });
      if (!classEntity) throw new Error('Class not found');
      classSchedule.class = classEntity;
    }

    if (updateDto.scheduleID) {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: updateDto.scheduleID, isDelete: false },
      });
      if (!schedule) throw new Error('Schedule not found');
      classSchedule.schedule = schedule;
    }

    if (updateDto.lessonID) {
      const lesson = await this.lessonRepository.findOne({
        where: { id: updateDto.lessonID, isDelete: false },
      });
      if (!lesson) throw new Error('Lesson not found');
      classSchedule.lesson = lesson;
    }

    return await this.classScheduleRepository.save(classSchedule);
  }

  async remove(id: number): Promise<void> {
    // await this.classScheduleRepository.delete(id);
    const classSchedule = await this.classScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!classSchedule) {
      throw new NotFoundException(`classSchedule with ID ${id} not found`);
    }
    classSchedule.isDelete = true;
    await this.classScheduleRepository.save(classSchedule);
  }
}
