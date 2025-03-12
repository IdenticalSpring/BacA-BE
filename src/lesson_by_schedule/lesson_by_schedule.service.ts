import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import {
  CreateLessonByScheduleDto,
  CreateManyLessonsDto,
  UpdateLessonByScheduleDto,
} from './lesson_by_schedule.dto';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';

@Injectable()
export class LessonByScheduleService {
  constructor(
    @InjectRepository(LessonBySchedule)
    private readonly lessonByScheduleRepository: Repository<LessonBySchedule>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<LessonBySchedule[]> {
    return await this.lessonByScheduleRepository.find({
      where: { isDelete: false },
    });
  }

  async findOne(id: number): Promise<LessonBySchedule> {
    return await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
  }

  async create(
    createDto: CreateLessonByScheduleDto,
  ): Promise<LessonBySchedule> {
    const classEntity = await this.classRepository.findOne({
      where: { id: createDto.classID, isDelete: false },
    });
    if (!classEntity) throw new Error('Class not found');

    const schedule = await this.scheduleRepository.findOne({
      where: { id: createDto.scheduleID, isDelete: false },
    });
    if (!schedule) throw new Error('Schedule not found');

    const lessonBySchedule = this.lessonByScheduleRepository.create({
      class: classEntity,
      schedule: schedule,
      lessonID: createDto.lessonID,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      date: createDto.date,
    });

    return await this.lessonByScheduleRepository.save(lessonBySchedule);
  }

  async createMany(
    createManyDto: CreateManyLessonsDto,
  ): Promise<LessonBySchedule[]> {
    const lessons = [];

    for (const lessonDto of createManyDto.lessons) {
      const classEntity = await this.classRepository.findOne({
        where: { id: lessonDto.classID, isDelete: false },
      });
      if (!classEntity)
        throw new Error(`Class with ID ${lessonDto.classID} not found`);

      const schedule = await this.scheduleRepository.findOne({
        where: { id: lessonDto.scheduleID, isDelete: false },
      });
      if (!schedule)
        throw new Error(`Schedule with ID ${lessonDto.scheduleID} not found`);

      const lessonBySchedule = this.lessonByScheduleRepository.create({
        class: classEntity,
        schedule: schedule,
        lessonID: lessonDto.lessonID,
        startTime: lessonDto.startTime,
        endTime: lessonDto.endTime,
        date: lessonDto.date,
      });

      lessons.push(lessonBySchedule);
    }

    return await this.lessonByScheduleRepository.save(lessons);
  }

  async update(
    id: number,
    updateDto: UpdateLessonByScheduleDto,
  ): Promise<LessonBySchedule> {
    const { scheduleID, classID, ...rest } = updateDto;
    const lessonBySchedule = await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!lessonBySchedule) throw new Error('LessonBySchedule not found');

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID, isDelete: false },
      });
      if (!classEntity) throw new Error('Class not found');
      lessonBySchedule.class = classEntity;
    }

    if (scheduleID) {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleID, isDelete: false },
      });
      if (!schedule) throw new Error('Schedule not found');
      lessonBySchedule.schedule = schedule;
    }
    Object.assign(lessonBySchedule, rest);
    // if (updateDto.lessonID !== undefined) lessonBySchedule.lessonID = updateDto.lessonID;
    // if (updateDto.startTime) lessonBySchedule.startTime = updateDto.startTime;
    // if (updateDto.endTime) lessonBySchedule.endTime = updateDto.endTime;
    // if (updateDto.date) lessonBySchedule.date = updateDto.date;

    return await this.lessonByScheduleRepository.save(lessonBySchedule);
  }

  async remove(id: number): Promise<void> {
    // await this.lessonByScheduleRepository.delete(id);
    const lessonBySchedule = await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!lessonBySchedule) {
      throw new NotFoundException(`lessonBySchedule with ID ${id} not found`);
    }
    lessonBySchedule.isDelete = true;
    await this.lessonByScheduleRepository.save(lessonBySchedule);
  }
}
