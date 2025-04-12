import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LessonBySchedule } from './lesson_by_schedule.entity';
import {
  CreateLessonByScheduleDto,
  CreateManyLessonsDto,
  UpdateHomeWorkOfLessonBySchedule,
  UpdateLessonByScheduleDto,
  UpdateLessonOfLessonBySchedule,
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
      relations: ['class', 'schedule'],
    });
  }
  async findAllLessonByScheduleOfClass(
    classID: number,
  ): Promise<LessonBySchedule[]> {
    return await this.lessonByScheduleRepository.find({
      where: { class: { id: classID }, isDelete: false },
      relations: ['class', 'schedule'],
    });
  }
  async updateLessonForLessonBySchedule(
    id: number,
    updateDto: UpdateLessonOfLessonBySchedule,
  ): Promise<LessonBySchedule> {
    const lessonBySchedule = await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!lessonBySchedule) throw new Error('LessonBySchedule not found');
    lessonBySchedule.lessonID = updateDto.lessonID;
    return await this.lessonByScheduleRepository.save(lessonBySchedule);
  }
  async updateHomeWorkForLessonBySchedule(
    id: number,
    updateDto: UpdateHomeWorkOfLessonBySchedule,
  ): Promise<LessonBySchedule> {
    const lessonBySchedule = await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!lessonBySchedule) throw new Error('LessonBySchedule not found');
    lessonBySchedule.homeWorkId = updateDto.homeWorkId;
    return await this.lessonByScheduleRepository.save(lessonBySchedule);
  }
  async findOne(id: number): Promise<LessonBySchedule> {
    return await this.lessonByScheduleRepository.findOne({
      where: { id, isDelete: false },
    });
  }
  async getSchedulesByClass(classId: number): Promise<Schedule[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    const lessons = await this.lessonByScheduleRepository.find({
      where: { class: classEntity },
      relations: ['schedule'],
      select: ['schedule'],
    });
    // console.log(lessons);

    // return lessons.map((lesson) => lesson.schedule);
    const uniqueSchedules = Array.from(
      new Map(
        lessons.map((lesson) => [lesson.schedule.id, lesson.schedule]),
      ).values(),
    );
    return uniqueSchedules;
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

    // Lấy danh sách class và schedule
    const classIds = createManyDto.lessons.map((l) => l.classID);
    const classEntities = await this.classRepository.findBy({
      id: In(classIds),
    });

    if (classEntities.length === 0) {
      throw new NotFoundException(`No classes found for given IDs`);
    }

    const scheduleIds = createManyDto.lessons.map((l) => l.scheduleID);
    const scheduleEntities = await this.scheduleRepository.findBy({
      id: In(scheduleIds),
    });

    if (scheduleEntities.length === 0) {
      throw new NotFoundException(`No schedules found for given IDs`);
    }

    for (const lessonDto of createManyDto.lessons) {
      const classEntity = classEntities.find(
        (cls) => cls.id === lessonDto.classID,
      );
      if (!classEntity)
        throw new NotFoundException(
          `Class with ID ${lessonDto.classID} not found`,
        );

      const schedule = scheduleEntities.find(
        (sch) => sch.id === lessonDto.scheduleID,
      );
      if (!schedule)
        throw new NotFoundException(
          `Schedule with ID ${lessonDto.scheduleID} not found`,
        );

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
    if (!lessonBySchedule)
      throw new NotFoundException('LessonBySchedule not found');

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID, isDelete: false },
      });
      if (!classEntity) throw new NotFoundException('Class not found');
      lessonBySchedule.class = classEntity;
    }

    if (scheduleID) {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleID, isDelete: false },
      });
      if (!schedule) throw new NotFoundException('Schedule not found');
      lessonBySchedule.schedule = schedule;
    }
    Object.assign(lessonBySchedule, rest);
    // if (updateDto.lessonID !== undefined) lessonBySchedule.lessonID = updateDto.lessonID;
    // if (updateDto.startTime) lessonBySchedule.startTime = updateDto.startTime;
    // if (updateDto.endTime) lessonBySchedule.endTime = updateDto.endTime;
    // if (updateDto.date) lessonBySchedule.date = updateDto.date;

    return await this.lessonByScheduleRepository.save(lessonBySchedule);
  }
  async updateSendingHomeWorkStatus(
    id: number,
    isHomeWorkSent: boolean,
  ): Promise<LessonBySchedule> {
    const lessonByScheduleEntity =
      await this.lessonByScheduleRepository.findOne({
        where: { id: id },
      });
    console.log(lessonByScheduleEntity);

    if (!lessonByScheduleEntity) {
      throw new NotFoundException('lesson By Schedule not found');
    }
    return await this.lessonByScheduleRepository.save({
      id,
      isHomeWorkSent,
    });
  }
  async updateSendingLessonStatus(
    id: number,
    isLessonSent: boolean,
  ): Promise<LessonBySchedule> {
    const lessonByScheduleEntity =
      await this.lessonByScheduleRepository.findOne({
        where: { id: id },
      });
    console.log(lessonByScheduleEntity);
    if (!lessonByScheduleEntity) {
      throw new NotFoundException('lesson By Schedule not found');
    }

    return await this.lessonByScheduleRepository.save({
      id,
      isLessonSent,
    });
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
